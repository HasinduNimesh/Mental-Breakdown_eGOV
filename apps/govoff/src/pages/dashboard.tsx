import React from 'react'
import { useRouter } from 'next/router'
import { Layout } from '@/components/Layout'
import { getSupabase } from '@/lib/supabaseClient'

type Booking = {
  booking_code: string
  service_id: string
  office_id: string
  slot_date: string
  slot_time: string
  status: string
  full_name: string | null
}

export default function Dashboard() {
  const supabase = React.useMemo(()=>getSupabase(), [])
  const router = useRouter()
  const [deptId, setDeptId] = React.useState<string|null>(null)
  const [today, setToday] = React.useState<Booking[]>([])
  const [upcoming, setUpcoming] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'All'|'Scheduled'|'Checked-in'|'Completed'|'Cancelled'>('All')
  const [dept, setDept] = React.useState<'police'|'passport'|'immigration'|'citizen-services'>('police')
  const [role, setRole] = React.useState<'admin'|'officer'>('admin')

  // Calendar state (month view)
  const now = React.useMemo(()=> new Date(), [])
  const [viewMonth, setViewMonth] = React.useState<number>(now.getMonth())
  const [viewYear, setViewYear] = React.useState<number>(now.getFullYear())
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  // Client-only clock text to avoid SSR hydration mismatch
  const [nowText, setNowText] = React.useState('')
  React.useEffect(()=>{
    function tick(){ setNowText(formatDateTime(new Date())) }
    tick(); const t = setInterval(tick, 1000)
    return ()=> clearInterval(t)
  },[])

  React.useEffect(()=>{
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        // officer profile (optional, placeholder)
  const { data: prof } = await supabase.auth.getUser()
  const meta = (prof.user?.user_metadata ?? {}) as Record<string, unknown>
  const d = typeof meta.department_id === 'string' ? meta.department_id : null
        if (!cancelled) setDeptId(d)

  const dateStr = toLocalYmd(selectedDate)
  const params = new URLSearchParams({ from: dateStr })
  if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter)
  if (q.trim()) params.set('q', q.trim())
  params.set('_', String(Date.now()))
  const api = `/api/officer/bookings?${params.toString()}`
        const resp = await fetch(api)
        const json = await resp.json()
        const all = (json?.items||[]) as Booking[]
  const t = all.filter(b => b.slot_date === dateStr)
  const u = all.filter(b => b.slot_date > dateStr)
        if (!cancelled) { setToday(t); setUpcoming(u) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[supabase, q, statusFilter, selectedDate])

  return (
    <Layout>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Police — Admin</h1>
          <div className="text-xs text-gray-600">Department-specific KPIs and quick actions.</div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded border bg-white">Light</span>
          <span className="text-gray-600 hidden sm:inline" suppressHydrationWarning>{nowText}</span>
          {loading && <span className="text-blue-600">Loading…</span>}
          <div className="hidden sm:flex items-center gap-2">
            <label className="text-gray-600">Dept</label>
            <select className="border rounded px-2 py-1" value={dept} onChange={(e)=>setDept(e.target.value as typeof dept)}>
              <option value="police">police</option>
              <option value="passport">passport</option>
              <option value="immigration">immigration</option>
              <option value="citizen-services">citizen-services</option>
            </select>
            <label className="text-gray-600">Role</label>
            <select className="border rounded px-2 py-1" value={role} onChange={(e)=>setRole(e.target.value as typeof role)}>
              <option value="admin">admin</option>
              <option value="officer">officer</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI + Status + Calendar grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3">
          <Kpi title="Appointments today" value={today.length} />
          <Kpi title="Upcoming" value={upcoming.length} />
          <Kpi title="Delayed" value={countDelayed(today)} tone="amber" />
          <Kpi title="Completed" value={today.filter(b=>b.status==='Completed').length} tone="emerald" />
          {/* Quick actions */}
          <QuickAction title="Complaints Desk" onClick={()=>router.push('/reports')} />
          <QuickAction title="Verification" onClick={()=>router.push('/search')} />
          <QuickAction title="Analytics" variant="primary" onClick={()=>router.push('/reports')} />
        </div>

        {/* Status donut */}
        <div className="bg-white border rounded shadow-sm p-4">
          <StatusDonut items={today} />
        </div>

        {/* Calendar */}
        <div className="bg-white border rounded shadow-sm p-4">
          <Calendar
            month={viewMonth}
            year={viewYear}
            selected={selectedDate}
            onPrev={()=>{
              const d = new Date(viewYear, viewMonth-1, 1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth())
            }}
            onNext={()=>{
              const d = new Date(viewYear, viewMonth+1, 1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth())
            }}
            onToday={()=>{ const d=new Date(); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); setSelectedDate(d) }}
            onSelect={(d)=>setSelectedDate(d)}
          />
        </div>
      </div>

      {/* Appointments table */}
      <section className="bg-white border rounded shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Sri Lanka Police Appointments</h2>
          <div className="flex items-center gap-2">
            <input className="w-56 border rounded px-3 py-2 text-sm" placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} />
            <select className="border rounded px-2 py-2 text-sm" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value as typeof statusFilter)}>
              <option>All</option>
              <option>Scheduled</option>
              <option>Checked-in</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <button className="px-3 py-2 border rounded text-sm" onClick={()=>exportCsv(today)}>Export CSV</button>
          </div>
        </div>
        <Table items={today} />
      </section>

      {/* Document review loader */}
      <section className="bg-white border rounded shadow-sm p-4 mt-6">
        <h3 className="font-semibold mb-2">Pre-submitted Document Review</h3>
        <QuickDocLoader />
      </section>
      <div className="mt-6 text-xs text-gray-600">Department (profile): {deptId ?? '—'}</div>
    </Layout>
  )
}

function Table({ items }: { items: Booking[] }) {
  if (!items.length) return <div className="text-sm text-gray-600">No appointments today.</div>
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border rounded-md">
        <thead className="bg-gray-50/80 border-b">
          <tr>
            <Th>Appointment</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Department</Th>
            <Th>Status</Th>
            <Th>ETA / Delay</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {items.map(b => (
            <tr key={b.booking_code} className="border-b last:border-0 hover:bg-slate-50/50">
              <Td>{b.booking_code}</Td>
              <Td>{b.slot_date}</Td>
              <Td>{(b.slot_time||'').slice(0,5)}</Td>
              <Td>{b.office_id}</Td>
              <Td><StatusChip value={b.status} /></Td>
              <Td><DelayLabel booking={b} /></Td>
              <Td>
                <a href={`/bookings/${encodeURIComponent(b.booking_code)}`} className="text-blue-600 hover:underline">Open</a>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: React.PropsWithChildren) { return <th className="text-left px-3 py-2 font-medium text-gray-700">{children}</th> }
function Td({ children }: React.PropsWithChildren) { return <td className="px-3 py-2">{children}</td> }

function StatusChip({ value }: { value: string }) {
  const map: Record<string, string> = {
    'Scheduled': 'bg-amber-100 text-amber-900 border-amber-200',
    'Checked-in': 'bg-blue-100 text-blue-900 border-blue-200',
    'Completed': 'bg-emerald-100 text-emerald-900 border-emerald-200',
    'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
  }
  const cls = map[value] || 'bg-slate-100 text-slate-800 border-slate-200'
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded border ${cls}`}>{value}</span>
}

function DelayLabel({ booking }: { booking: Booking }) {
  const label = computeDelayLabel(booking)
  if (!label) return <span className="text-gray-500">—</span>
  const late = label.startsWith('Delayed')
  return <span className={late? 'text-red-600' : 'text-gray-700'}>{label}</span>
}

function computeDelayLabel(b: Booking): string | null {
  const time = (b.slot_time||'').slice(0,5)
  if (!b.slot_date || !time) return null
  const [h,m] = time.split(':').map(Number)
  const scheduled = new Date(`${b.slot_date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)
  const now = new Date()
  if (b.status === 'Completed' || b.status === 'Cancelled') return '—'
  if (now <= scheduled) return '—'
  const mins = Math.floor((now.getTime() - scheduled.getTime())/60000)
  const hPart = Math.floor(mins/60)
  const mPart = mins%60
  if (hPart > 0) return `Delayed by ${hPart}h ${mPart}m`
  return `Delayed by ${mPart}m`
}

function countDelayed(items: Booking[]) {
  return items.filter(b => computeDelayLabel(b)?.startsWith('Delayed')).length
}

function Kpi({ title, value, tone }: { title: string; value: number; tone?: 'amber'|'emerald' }) {
  const toneMap: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    default: 'bg-slate-50 border-slate-200'
  }
  const cls = tone ? toneMap[tone] : toneMap.default
  return (
    <div className={`p-4 rounded border ${cls}`}>
      <div className="text-xs text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function QuickAction({ title, onClick, variant }: { title: string; onClick: () => void; variant?: 'primary' }) {
  const base = 'p-4 rounded border bg-slate-50 border-slate-200 flex items-center justify-between'
  const primary = variant === 'primary'
  return (
    <div className={base}>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-gray-600">Open module</div>
      </div>
      <button onClick={onClick} className={`px-3 py-1.5 rounded text-sm border ${primary? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>{primary? 'View' : 'Open'}</button>
    </div>
  )
}

function StatusDonut({ items }: { items: Booking[] }) {
  const counts = React.useMemo(()=>{
    const result = { delayed: 0, inprogress: 0, onhold: 0, completed: 0 }
    for (const b of items) {
      if (b.status === 'Completed') result.completed++
      else if (b.status === 'Cancelled') result.onhold++
      else if (computeDelayLabel(b)) result.delayed++
      else result.inprogress++
    }
    return result
  }, [items])
  const total = Math.max(1, counts.delayed + counts.inprogress + counts.onhold + counts.completed)
  const p = {
    delayed: Math.round((counts.delayed/total)*100),
    inprogress: Math.round((counts.inprogress/total)*100),
    onhold: Math.round((counts.onhold/total)*100),
    completed: Math.round((counts.completed/total)*100),
  }
  const donutStyle: React.CSSProperties = {
    background: `conic-gradient(#f59e0b 0 ${p.delayed}%, #3b82f6 ${p.delayed}% ${p.delayed+p.inprogress}%, #9ca3af ${p.delayed+p.inprogress}% ${p.delayed+p.inprogress+p.onhold}%, #10b981 ${p.delayed+p.inprogress+p.onhold}% 100%)`,
  }
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-40 h-40 rounded-full" style={donutStyle}>
        <div className="absolute inset-4 bg-white rounded-full grid place-items-center text-xl font-semibold">
          {items.length || 0}
        </div>
      </div>
      <div className="text-sm">
        <div className="mb-2 font-medium">Today</div>
        <LegendItem color="#f59e0b" label="Delayed" value={counts.delayed} />
        <LegendItem color="#3b82f6" label="In progress" value={counts.inprogress} />
        <LegendItem color="#9ca3af" label="On hold" value={counts.onhold} />
        <LegendItem color="#10b981" label="Completed" value={counts.completed} />
      </div>
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="inline-block w-3 h-3 rounded" style={{ background: color }} />
      <span>{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  )
}

function Calendar({ month, year, selected, onPrev, onNext, onToday, onSelect }: { month: number; year: number; selected: Date; onPrev: ()=>void; onNext: ()=>void; onToday: ()=>void; onSelect: (d: Date)=>void }) {
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0=Sun
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const cells: Array<Date|null> = []
  for (let i=0;i<startDay;i++) cells.push(null)
  for (let d=1; d<=daysInMonth; d++) cells.push(new Date(year, month, d))
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{formatMonthYear(year, month)}</div>
        <div className="flex items-center gap-2 text-sm">
          <button className="px-2 py-1 border rounded" onClick={onPrev}>{'<'}</button>
          <button className="px-2 py-1 border rounded" onClick={onNext}>{'>'}</button>
          <button className="px-2 py-1 border rounded" onClick={onToday}>Today</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=> <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
    {cells.map((d,i)=> d ? (
          <button
      key={d.toISOString()}
            className={`aspect-square rounded border text-sm ${isSameDay(d, selected)?'bg-blue-600 text-white border-blue-600':'bg-white'}`}
            onClick={()=>onSelect(d)}
          >{d.getDate()}</button>
    ) : <div key={`empty-${i}`} />)}
      </div>
    </div>
  )
}

function QuickDocLoader() {
  const router = useRouter()
  const [code, setCode] = React.useState('')
  return (
    <div className="mt-2 flex items-center gap-2">
      <input className="border rounded px-3 py-2 text-sm w-64" placeholder="Booking code" value={code} onChange={(e)=>setCode(e.target.value.trim())} />
      <button className="px-3 py-2 border rounded text-sm" onClick={()=>{ if(code) router.push(`/bookings/${encodeURIComponent(code)}`) }}>Load</button>
    </div>
  )
}

function exportCsv(items: Booking[]) {
  if (!items.length) return
  const headers = ['Code','Date','Time','Department','Status']
  const rows = items.map(b=> [b.booking_code, b.slot_date, (b.slot_time||'').slice(0,5), b.office_id, b.status])
  const csv = [headers, ...rows].map(r=> r.map(v=> `"${String(v).replace(/"/g,'\"')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `appointments_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function formatMonthYear(year:number, month:number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}

function formatDateTime(d: Date) {
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })
}

function toLocalYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${dd}`
}
