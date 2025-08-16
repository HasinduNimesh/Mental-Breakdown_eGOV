import * as React from "react";
import clsx from "clsx";

type Frame = "day" | "week" | "month";

export type Segment = {
  label: "Delayed" | "On hold" | "In progress" | "Completed";
  value: number;
  className: string; // Tailwind text-* color (we use stroke-current)
};

interface Props {
  segments: Segment[];
  frame: Frame;
  onChangeFrame?: (f: Frame) => void;

  /** e.g. "27th June 2025", "24–30 Jun 2025", "March 2025" */
  periodLabel: string;
  onPrev?: () => void; // go to previous day/week/month
  onNext?: () => void; // go to next day/week/month

  className?: string;
}

export function AppointmentDonutCard({
  segments,
  frame,
  onChangeFrame,
  periodLabel,
  onPrev,
  onNext,
  className,
}: Props) {
  const total = React.useMemo(() => segments.reduce((n, s) => n + s.value, 0), [segments]);

  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur p-5 shadow-sm",
        className
      )}
    >
      {/* Header: LEFT = period + arrows, RIGHT = segmented control */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NavBtn ariaLabel="Previous period" onClick={onPrev} />
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 tabular-nums">
            {periodLabel}
          </div>
          <NavBtn ariaLabel="Next period" onClick={onNext} direction="next" />
        </div>

        <Segmented
          value={frame}
          onChange={onChangeFrame}
          options={[
            { value: "day", label: "Today" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />
      </div>

      {/* Donut with centered total */}
      <div className="mt-4 relative grid place-items-center">
        <Donut segments={segments} total={total} size={220} thickness={22} />
        <div
            className="absolute flex flex-col items-center select-none"
            role="group"
            aria-label="Total number of appointments"
        >
            <span className="text-4xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {total.toLocaleString()}
            </span>
            <span className="mt-1 text-[11px] leading-3 text-slate-500 dark:text-slate-400">
            Total&nbsp;No.&nbsp;of&nbsp;appointments
            </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={clsx("inline-block h-2.5 w-2.5 rounded-full", textToBg(s.className))} />
            <span className="text-slate-700 dark:text-slate-300">{s.label}</span>
            <span className="ml-auto tabular-nums text-slate-600 dark:text-slate-400">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pure SVG donut using stroke-dasharray offsets */
function Donut({
  segments,
  total,
  size = 180,
  thickness = 18,
}: {
  segments: Segment[];
  total: number;
  size?: number;
  thickness?: number;
}) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
        {/* track */}
        <circle r={radius} cx="0" cy="0" fill="none" stroke="rgba(203,213,225,0.5)" strokeWidth={thickness} />
        {segments.map((s) => {
          const len = total ? (s.value / total) * circumference : 0;
          const el = (
            <circle
              key={s.label}
              r={radius}
              cx="0"
              cy="0"
              fill="none"
              className={s.className}
              stroke="currentColor"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${Math.max(len - 1, 0)} ${circumference}`} // tiny gap for rounded caps
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </g>
    </svg>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: "day" | "week" | "month";
  onChange?: (v: "day" | "week" | "month") => void;
  options: { value: "day" | "week" | "month"; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200/70 dark:border-slate-800/60 p-0.5 bg-white/60 dark:bg-slate-900/40">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange?.(o.value)}
            className={clsx(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              active
                ? "bg-gradient-to-r from-sky-500 to-violet-500 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
            )}
            type="button"
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
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

/** Convert text-* to bg-* for legend dots */
function textToBg(textClass: string) {
  return textClass.replace(/^text-/, "bg-");
}
