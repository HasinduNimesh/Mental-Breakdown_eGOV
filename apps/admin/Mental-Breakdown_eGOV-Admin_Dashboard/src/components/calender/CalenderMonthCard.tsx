import * as React from "react";
import clsx from "clsx";

export type DayCounts = {
  delayed: number;
  onhold: number;
  inprogress: number;
  completed: number;
  total: number;
};

interface Props {
  monthDate: Date;                 // any date in the visible month
  selectedDate?: Date | null;      // highlight if provided
  getCountsForDate: (d: Date) => DayCounts;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onSelectDate?: (d: Date) => void;
  className?: string;
}

const DOW = ["Mo", "Tue", "We", "Th", "Fri", "Sat", "Sun"];
const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function CalendarMonthCard({
  monthDate,
  selectedDate,
  getCountsForDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  className,
}: Props) {
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const start = startOfWeek(first);
  const end = endOfWeek(last);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(new Date(d));

  const title = `${MONTHS_LONG[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  const selKey = selectedDate ? ymd(selectedDate) : null;
  const todayKey = ymd(new Date());
  const monthIdx = monthDate.getMonth();

  return (
    <div className={clsx(
      "rounded-2xl border border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur p-4 shadow-sm",
      className
    )}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NavBtn ariaLabel="Previous month" onClick={onPrevMonth} />
          <div className="text-sm font-semibold">{title}</div>
          <NavBtn ariaLabel="Next month" onClick={onNextMonth} direction="next" />
        </div>
        <button
          type="button"
          onClick={() => onSelectDate?.(new Date())}
          className="text-xs rounded-md px-2 py-1 border border-slate-200/70 hover:bg-slate-100/60"
        >
          Today
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-[11px] font-medium text-slate-500 mb-1">
        {DOW.map((d) => <div key={d} className="px-1 py-1 text-center">{d}</div>)}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = ymd(d);
          const counts = getCountsForDate(d);
          const isToday = key === todayKey;
          const isSelected = key === selKey;
          const isDim = d.getMonth() !== monthIdx;

          // heatmap-ish hint
          const severity = counts.delayed * 2 + counts.onhold;
          const heat =
            severity >= 6 ? "bg-red-50" :
            severity >= 3 ? "bg-orange-50" :
            counts.total >= 1 ? "bg-lime-50" : "";

          const aria = [
            formatLongDate(d),
            counts.total ? `${counts.total} appointments` : "no appointments",
            counts.delayed ? `${counts.delayed} delayed` : "",
            counts.onhold ? `${counts.onhold} on hold` : "",
            counts.inprogress ? `${counts.inprogress} in progress` : "",
            counts.completed ? `${counts.completed} completed` : ""
          ].filter(Boolean).join(", ");

          return (
            <div key={key} className="group relative">
              <button
                type="button"
                onClick={() => onSelectDate?.(d)}
                aria-label={aria}
                className={clsx(
                  "w-full aspect-square rounded-lg border transition-colors text-sm",
                  heat,
                  isSelected
                    ? "border-sky-400 ring-2 ring-sky-300/50"
                    : "border-slate-200/70 hover:bg-slate-100/60 dark:border-slate-800/60 dark:hover:bg-slate-800/40",
                  isDim && "opacity-60"
                )}
              >
                <div className="flex h-full flex-col items-center justify-between p-1.5">
                  <div className={clsx(
                    "text-[12px] font-medium",
                    isToday && "text-sky-600"
                  )}>
                    {d.getDate()}
                  </div>

                  {/* Status dots */}
                  <div className="flex items-center gap-1">
                    {counts.delayed > 0 && <Dot className="bg-red-500" title={`${counts.delayed} delayed`} />}
                    {counts.onhold > 0 && <Dot className="bg-orange-400" title={`${counts.onhold} on hold`} />}
                    {counts.inprogress > 0 && <Dot className="bg-lime-400" title={`${counts.inprogress} in progress`} />}
                    {counts.completed > 0 && <Dot className="bg-green-600" title={`${counts.completed} completed`} />}
                  </div>
                </div>
              </button>

              {/* Hover tooltip */}
              {counts.total > 0 && (
                <div className="pointer-events-none absolute left-1/2 z-10 hidden -translate-x-1/2 translate-y-2 rounded-md border border-slate-200/70 bg-white p-2 text-xs shadow-md group-hover:block dark:border-slate-800/60 dark:bg-slate-900">
                  <div className="font-medium mb-1">{formatLongDate(d)}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                    <Row label="Delayed" value={counts.delayed} />
                    <Row label="On hold" value={counts.onhold} />
                    <Row label="In progress" value={counts.inprogress} />
                    <Row label="Completed" value={counts.completed} />
                    <div className="col-span-2 mt-1 text-[11px] text-slate-500">{counts.total} total</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dot({ className, title }: { className: string; title?: string }) {
  return <span title={title} className={clsx("h-1.5 w-1.5 rounded-full", className)} />;
}
function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between gap-3"><span>{label}</span><span className="tabular-nums">{value}</span></div>;
}

// ---- date utils ----
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function startOfWeek(d: Date) { const day = d.getDay(); const diff = (day + 6) % 7; const x = new Date(d); x.setDate(d.getDate() - diff); x.setHours(0,0,0,0); return x; }
function endOfWeek(d: Date) { return addDays(startOfWeek(d), 6); }
function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function formatLongDate(d: Date) {
  const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const day = d.getDate();
  const ord = ["th", "st", "nd", "rd"][(day % 10 > 3 || Math.floor(day % 100 / 10) === 1) ? 0 : day % 10] || "th";
  return `${day}${ord} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

function NavBtn({ onClick, direction = "prev", ariaLabel }: { onClick?: () => void; direction?: "prev" | "next"; ariaLabel: string }) {
  const isNext = direction === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200/70 dark:border-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        {isNext ? (
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4A1 1 0 0112.707 6.707L9.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
        )}
      </svg>
    </button>
  );
}
