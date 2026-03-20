import React, { useMemo } from "react";
import { Map } from "lucide-react";
import { ZONES } from "../data/constants";
import { ProgressBar } from "./ui/primitives";

function RainEffect() {
  const drops = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    height: `${22 + Math.random() * 38}px`,
    delay: `${Math.random() * 2}s`,
    duration: `${0.5 + Math.random() * 0.7}s`,
    opacity: 0.3 + Math.random() * 0.45,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((d, i) => (
        <div key={i} className="raindrop absolute"
          style={{ left: d.left, height: d.height, opacity: d.opacity, animationDelay: d.delay, animationDuration: d.duration }} />
      ))}
    </div>
  );
}

export default function LiveMonitor({ zone, activeTrigger, sensors }) {
  const zoneInfo = ZONES.find(z => z.id === zone);
  const isRaining = activeTrigger === "rain";
  const isAlert   = !!activeTrigger;

  const metrics = [
    { label: "Rainfall", value: sensors.rain.toFixed(1), unit: "mm/hr", threshold: 15, icon: "🌧️", triggered: sensors.rain >= 15 },
    { label: "AQI",      value: Math.round(sensors.aqi), unit: "",       threshold: 300, icon: "💨", triggered: sensors.aqi >= 300 },
    { label: "Orders",   value: `${Math.round(sensors.orders)}`, unit: "%", threshold: 30, icon: "📦", triggered: sensors.orders < 30, inverse: true },
    { label: "Temp",     value: sensors.temp.toFixed(1), unit: "°C",     threshold: 44, icon: "🌡️", triggered: sensors.temp >= 44 },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Map visual */}
      <div className="relative w-full h-[180px] bg-[#0d1117] rounded-xl overflow-hidden border border-border2">
        {/* Grid */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {isRaining && <RainEffect />}

        {/* Zone ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-500"
          style={{ borderColor: isAlert ? "rgba(244,63,94,0.5)" : "rgba(245,158,11,0.35)", background: isAlert ? "rgba(244,63,94,0.05)" : "rgba(245,158,11,0.03)" }}>
          <span className="text-[10px] font-semibold" style={{ color: isAlert ? "#f43f5e" : "#f59e0b" }}>Zone</span>
        </div>

        {/* Rider dot (you) */}
        <div className="absolute top-[48%] left-[52%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-pulse-amber shadow-[0_0_10px_currentColor] transition-colors"
          style={{ background: isAlert ? "#f43f5e" : "#f59e0b" }} />

        {/* Ghost riders */}
        {[{ t: "35%", l: "37%" }, { t: "62%", l: "64%" }].map((r, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-slate-600" style={{ top: r.t, left: r.l, transform: "translate(-50%,-50%)" }} />
        ))}

        <div className="absolute bottom-2 left-2.5 text-[10px] text-slate-500 font-mono">
          {isRaining ? "⛈️ HEAVY RAIN DETECTED" : "📍 GPS VERIFIED"}
        </div>
        <div className="absolute bottom-2 right-2.5 text-[10px] font-mono" style={{ color: isAlert ? "#f43f5e" : "#f59e0b" }}>🏍️ YOU</div>
        <div className="absolute top-2 left-2.5 flex items-center gap-1.5">
          <Map size={11} className="text-slate-500" />
          <span className="text-[10px] text-slate-500 font-mono">{zoneInfo?.name}, {zoneInfo?.city}</span>
        </div>
      </div>

      {/* Metric chips */}
      <div className="grid grid-cols-4 gap-2">
        {metrics.map(m => (
          <div key={m.label} className={`p-2.5 rounded-lg border text-center transition-all ${m.triggered ? "bg-rose-500/10 border-rose-500/30" : "bg-surface2 border-border2"}`}>
            <div className="text-base mb-1">{m.icon}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</div>
            <div className={`font-mono text-sm font-bold mt-0.5 ${m.triggered ? "text-rose-400" : "text-slate-100"}`}>
              {m.value}<span className="text-[9px] text-slate-500">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Threshold bars */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-display mb-3">Trigger Thresholds</p>
        <div className="flex flex-col gap-3.5">
          {metrics.map(m => {
            const numVal = parseFloat(m.value);
            const pct = Math.min((numVal / (m.threshold * 1.4)) * 100, 100);
            return (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">{m.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${m.triggered ? "text-rose-400" : "text-slate-200"}`}>{m.value}{m.unit}</span>
                    <span className="text-slate-600">/ {m.threshold}{m.unit}</span>
                    {m.triggered && <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full px-1.5 py-0.5 font-bold uppercase">FIRED</span>}
                  </div>
                </div>
                <ProgressBar value={pct} max={100} color={m.triggered ? "#f43f5e" : m.label === "Rainfall" ? "#38bdf8" : m.label === "AQI" ? "#a78bfa" : m.label === "Orders" ? "#f59e0b" : "#ef4444"} />
              </div>
            );
          })}
        </div>
      </div>

      {/* API feed status */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-display mb-3">Live Data Feeds</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "OpenWeatherMap", status: "Live",      ping: "142ms", ok: true },
            { name: "AQICN",         status: "Live",      ping: "98ms",  ok: true },
            { name: "GDELT / News",  status: "Live",      ping: "310ms", ok: true },
            { name: "Swiggy API",    status: "Simulated", ping: "—",     ok: false },
          ].map(a => (
            <div key={a.name} className="bg-surface2 border border-border2 rounded-lg p-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-200">{a.name}</span>
                <span className={`w-2 h-2 rounded-full ${a.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
              </div>
              <span className="text-[11px] text-slate-500">{a.status} · {a.ping}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-surface2 border border-border2 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-blink" />
          <span className="text-[11px] text-slate-500 font-mono">Next poll in ~12s · Scanning every 15 minutes</span>
        </div>
      </div>
    </div>
  );
}
