import React from "react";

/* ── Badge ─────────────────────────────────────────────────────────── */
export function Badge({ children, variant = "amber", className = "" }) {
  const variants = {
    amber:  "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    green:  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    red:    "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    blue:   "bg-sky-500/10 text-sky-400 border border-sky-500/30",
    violet: "bg-violet-500/10 text-violet-400 border border-violet-500/30",
    gray:   "bg-slate-500/10 text-slate-400 border border-slate-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

/* ── Card ───────────────────────────────────────────────────────────── */
export function Card({ children, className = "", style }) {
  return (
    <div className={`bg-surface border border-border rounded-xl overflow-hidden ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardInner({ children, className = "", style }) {
  return (
    <div className={`bg-surface2 border border-border2 rounded-lg ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ── Button ─────────────────────────────────────────────────────────── */
export function Btn({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 cursor-pointer border-0";
  const variants = {
    primary: "bg-amber-500 text-[#080a0f] hover:bg-amber-400 hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:-translate-y-px",
    ghost:   "bg-transparent text-slate-400 border border-border2 hover:border-amber-500/50 hover:text-amber-400",
    danger:  "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ── LiveDot ────────────────────────────────────────────────────────── */
export function LiveDot({ color = "green" }) {
  const colors = { green: "bg-emerald-400 animate-pulse-amber", amber: "bg-amber-400 animate-pulse-amber", red: "bg-rose-400 animate-pulse-rose" };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[color]}`} />;
}

/* ── CircularProgress ───────────────────────────────────────────────── */
export function CircularProgress({ value, max, color, size = 96 }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1c2333" strokeWidth="8" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth="8" strokeDasharray={circ} strokeDashoffset={dash}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="15" fontWeight="700" fontFamily="Space Mono, monospace"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

/* ── ProgressBar ────────────────────────────────────────────────────── */
export function ProgressBar({ value, max, color = "#f59e0b" }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1 rounded-full bg-border2 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ── StepIndicator ──────────────────────────────────────────────────── */
export function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold
              ${i < current ? "bg-emerald-500 text-black" : i === current ? "bg-amber-500 text-black" : "bg-border2 text-slate-500"}`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold font-display
              ${i === current ? "text-amber-400" : "text-slate-600"}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-14 h-0.5 mb-5 transition-all duration-500 ${i < current ? "bg-emerald-500" : "bg-border2"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
