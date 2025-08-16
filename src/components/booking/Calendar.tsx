import React from 'react';

type AvailabilityMap = Record<string, number>; // key = YYYY-MM-DD, value = available slots count

export interface CalendarProps {
  month: Date; // any date in the month being displayed
  selectedDate: Date;
  onMonthChange: (nextMonth: Date) => void;
  onSelectDate: (date: Date) => void;
  availabilityByDate?: AvailabilityMap;
  minDate?: Date; // disallow dates before this
  disableWeekdays?: number[]; // 0..6 (0=Sunday)
}

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfMonth(d: Date) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1);
  x.setDate(0);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function formatISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export const Calendar: React.FC<CalendarProps> = ({
  month,
  selectedDate,
  onMonthChange,
  onSelectDate,
  availabilityByDate = {},
  minDate,
  disableWeekdays = [0],
}) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const startWeekday = (monthStart.getDay() + 6) % 7; // convert to Mon=0..Sun=6
  const daysInMonth = monthEnd.getDate();
  const weeks: Array<Array<Date | null>> = [];
  let current: Array<Date | null> = new Array(startWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(monthStart);
    d.setDate(day);
    current.push(d);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  function isDisabled(d: Date): boolean {
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (disableWeekdays.includes(d.getDay())) return true;
    return false;
  }

  return (
    <div className="border border-border rounded-lg bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <button
          type="button"
          className="px-2 py-1 text-sm rounded hover:bg-bg-50"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          {'<'}
        </button>
        <div className="text-sm font-medium">
          {monthStart.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button
          type="button"
          className="px-2 py-1 text-sm rounded hover:bg-bg-50"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          {'>'}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px p-2 text-[11px] text-text-600">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-rows-6 gap-1 px-2 pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((d, di) => {
              if (!d) return <div key={di} className="h-10" />;
              const k = formatISO(d);
              const isSelected = formatISO(selectedDate) === k;
              const avail = availabilityByDate[k] ?? 0;
              const disabled = isDisabled(d);
              return (
                <button
                  key={di}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectDate(d)}
                  className={[
                    'h-10 rounded-md border text-sm flex flex-col items-center justify-center',
                    isSelected ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-border text-text-800 bg-white',
                    disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary-300',
                  ].join(' ')}
                  title={avail ? `${avail} slots available` : 'No slots'}
                >
                  <span>{d.getDate()}</span>
                  <span className={`text-[10px] ${avail > 0 ? 'text-emerald-600' : 'text-text-400'}`}>{avail > 0 ? `${avail} slots` : '—'}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
