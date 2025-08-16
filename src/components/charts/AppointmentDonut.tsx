import * as React from "react";
import clsx from "clsx";

type Frame = "day" | "week" | "month";

export type Segment = {
  label: "Delayed" | "On hold" | "In progress" | "Completed";
  value: number;
  className: string; // tailwind text- color class; we use stroke-current
};

interface Props {
  segments: Segment[];
  updatedAt: Date;
  frame: Frame;
  onChangeFrame?: (f: Frame) => void;
  className?: string;
}

export function AppointmentDonutCard({ segments, updatedAt, frame, onChangeFrame, className }: Props) {
  const total = React.useMemo(() => segments.reduce((n, s) => n + s.value, 0), [segments]);

  return (
    <div className={clsx(
      "rounded-2xl border border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur p-5 shadow-sm",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Today’s Appointments</div>
          <div className="text-xs text-slate-500">As of {updatedAt.toLocaleTimeString()}</div>
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

      {/* Chart */}
      <div className="mt-4 grid grid-cols-1 place-items-center">
        <Donut segments={segments} total={total} size={180} thickness={20} />
        <div className="mt-2 text-center">
          <div className="text-2xl font-semibold tabular-nums">{total.toLocaleString()}</div>
          <div className="text-xs text-slate-500">total appointments</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={clsx("inline-block h-2.5 w-2.5 rounded-full", colorDotToBg(s.className))} />
            <span className="text-slate-700 dark:text-slate-300">{s.label}</span>
            <span className="ml-auto tabular-nums text-slate-600 dark:text-slate-400">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pure SVG donut using stroke-dasharray offsets */
function Donut({ segments, total, size = 180, thickness = 18 }: { segments: Segment[]; total: number; size?: number; thickness?: number }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // cumulative offset
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
        {/* track */}
        <circle r={radius} cx="0" cy="0" fill="none" stroke="rgba(203,213,225,0.5)" strokeWidth={thickness} />
        {segments.map((s) => {
          const len = total ? (s.value / total) * circumference : 0;
          const circle = (
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
              strokeDasharray={`${Math.max(len - 1, 0)} ${circumference}`} // small gap to show rounded caps
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return circle;
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

/** Convert text-* to bg-* for legend dots */
function colorDotToBg(textClass: string) {
  return textClass.replace(/^text-/, "bg-");
}
