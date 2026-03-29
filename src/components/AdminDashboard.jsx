import React, { useEffect, useState } from "react";
import { BarChart2, TrendingUp, Users, AlertOctagon, ShieldOff, Activity } from "lucide-react";
import { ACTUARIAL, ZONES, TRIGGERS } from "../data/constants";
import { Badge, CardInner, ProgressBar, CircularProgress } from "./ui/primitives";

// Simulated pool data
function genWeeklyData() {
  return Array.from({ length: 6 }, (_, i) => {
    const premiums = Math.floor(ACTUARIAL.poolRiders * ACTUARIAL.avgWeeklyPremium * (0.88 + Math.random() * 0.25));
    const claims   = Math.floor(premiums * (0.45 + Math.random() * 0.32));
    return { week: `W${i + 1}`, premiums, claims, ratio: Math.round((claims / premiums) * 100) };
  });
}

const WEEKLY = genWeeklyData();
const CURRENT = WEEKLY[WEEKLY.length - 1];

function MiniBar({ value, max, color, height = 48 }) {
  const pct = Math.min(value / max, 1);
  return (
    <div className="flex items-end" style={{ height }}>
      <div className="w-full rounded-t transition-all duration-700" style={{ height: `${pct * 100}%`, background: color, minHeight: 4 }} />
    </div>
  );
}

export default function AdminDashboard({ allClaims = [] }) {
  const [tab, setTab] = useState("overview");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const totalPremiums    = WEEKLY.reduce((s, w) => s + w.premiums, 0);
  const totalPayouts     = WEEKLY.reduce((s, w) => s + w.claims, 0);
  const lossRatio        = totalPayouts / totalPremiums;
  const poolBalance      = totalPremiums - totalPayouts;
  const breakEvenRiders  = Math.ceil((CURRENT.claims / ACTUARIAL.avgWeeklyPremium));
  const maxWeeklyExposure = ACTUARIAL.poolRiders * 280; // standard daily payout

  // Simulated fraud flags
  const fraudFlags = [
    { id: "FF-001", zone: "Koramangala", reason: "Cluster anomaly — 12 static riders", severity: "high",   time: "14:32" },
    { id: "FF-002", zone: "Bandra",      reason: "Mock location permission detected",  severity: "high",   time: "13:05" },
    { id: "FF-003", zone: "CP",          reason: "Duplicate IP from 3 accounts",       severity: "medium", time: "11:48" },
    { id: "FF-004", zone: "Andheri",     reason: "Accelerometer flat during rain event",severity: "medium", time: "09:17" },
  ];

  const tabs = ["overview", "actuarial", "fraud", "triggers"];

  return (
    <div className="flex flex-col gap-0 animate-fade-up">
      {/* Admin header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-widest uppercase text-rose-400">Insurer Admin</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time pool health · Loss ratio · Fraud alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-mono">LIVE</span>
          <Badge variant="red">Admin View</Badge>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-widest transition-all whitespace-nowrap
              ${tab === t ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" : "text-slate-400 hover:text-slate-200 hover:bg-surface2"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="flex flex-col gap-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Pool Riders",       value: ACTUARIAL.poolRiders, sub: "Active this week",    color: "#38bdf8", icon: <Users size={14}/> },
              { label: "Premiums Collected",value: `₹${(totalPremiums/1000).toFixed(1)}K`, sub: "6-week total", color: "#10b981", icon: <TrendingUp size={14}/> },
              { label: "Total Payouts",     value: `₹${(totalPayouts/1000).toFixed(1)}K`, sub: "6-week total", color: "#f59e0b", icon: <BarChart2 size={14}/> },
              { label: "Fraud Flags",       value: fraudFlags.length, sub: "Pending review",          color: "#f43f5e", icon: <AlertOctagon size={14}/> },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <p className="font-display text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Weekly chart */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-4">Weekly Premiums vs Payouts</h3>
            <div className="flex items-end gap-3 h-32">
              {WEEKLY.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                  <div className="w-full flex gap-1 items-end h-24">
                    <div className="flex-1 flex items-end">
                      <MiniBar value={w.premiums} max={Math.max(...WEEKLY.map(x => x.premiums)) * 1.1} color="#10b981" height={96} />
                    </div>
                    <div className="flex-1 flex items-end">
                      <MiniBar value={w.claims} max={Math.max(...WEEKLY.map(x => x.premiums)) * 1.1} color="#f59e0b" height={96} />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{w.week}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-2 rounded-sm bg-emerald-500 inline-block" />Premiums</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-2 rounded-sm bg-amber-500 inline-block" />Payouts</span>
            </div>
          </div>

          {/* Pool health */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-4">Liquidity Pool Health</h3>
            <div className="flex items-center gap-6 mb-4">
              <CircularProgress value={poolBalance} max={totalPremiums} color={poolBalance / totalPremiums > 0.4 ? "#10b981" : "#f59e0b"} size={96} />
              <div>
                <p className="font-display text-3xl font-bold text-emerald-400">₹{(poolBalance / 1000).toFixed(1)}K</p>
                <p className="text-sm text-slate-400 mb-1">Reserve balance</p>
                <p className="text-xs text-slate-500">Max exposure this week: ₹{(maxWeeklyExposure / 1000).toFixed(0)}K</p>
                <div className="mt-2">
                  <Badge variant={poolBalance / maxWeeklyExposure > 0.5 ? "green" : "amber"}>
                    {Math.round((poolBalance / maxWeeklyExposure) * 100)}% coverage ratio
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Actuarial ── */}
      {tab === "actuarial" && (
        <div className="flex flex-col gap-4">
          {/* Loss ratio */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-4">Loss Ratio Analysis</h3>
            <div className="flex items-center gap-6 mb-5">
              <CircularProgress value={lossRatio * 100} max={100} color={lossRatio < 0.65 ? "#10b981" : lossRatio < 0.75 ? "#f59e0b" : "#f43f5e"} size={96} />
              <div>
                <p className="font-display text-3xl font-bold" style={{ color: lossRatio < 0.65 ? "#10b981" : "#f59e0b" }}>
                  {(lossRatio * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-slate-400 mb-1">Current loss ratio</p>
                <Badge variant={lossRatio < 0.65 ? "green" : "amber"}>
                  Target: &lt;65% · {lossRatio < 0.65 ? "✓ Healthy" : "⚠ Monitor"}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {WEEKLY.map((w, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{w.week}</span>
                    <span className={`font-mono font-bold ${w.ratio < 65 ? "text-emerald-400" : w.ratio < 75 ? "text-amber-400" : "text-rose-400"}`}>{w.ratio}%</span>
                  </div>
                  <ProgressBar value={w.ratio} max={100} color={w.ratio < 65 ? "#10b981" : w.ratio < 75 ? "#f59e0b" : "#f43f5e"} />
                </div>
              ))}
            </div>
          </div>

          {/* Actuarial breakdown */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-4">Premium Justification</h3>
            <p className="text-xs text-slate-500 mb-4">How ₹49/wk (Standard) is derived for Koramangala zone</p>
            <div className="flex flex-col gap-2">
              {[
                { step: "Avg trigger days/month",    val: "4.2 days",   note: "From 3yr OpenWeatherMap data" },
                { step: "Expected claim per event",  val: "₹280",       note: "Standard tier daily payout" },
                { step: "Monthly claim exposure",    val: "₹1,176",     note: "4.2 × ₹280" },
                { step: "Weekly claim exposure",     val: "₹271",       note: "÷ 4.33 weeks" },
                { step: "Admin cost (5%)",           val: "₹14",        note: "Automation saves 25% vs industry" },
                { step: "Risk pooling discount",     val: "−₹236",      note: "Across 340 riders, not all trigger together" },
                { step: "Final weekly premium",      val: "₹49",        note: "Viable at 340+ riders in zone" },
              ].map((r, i) => (
                <CardInner key={i} className="flex justify-between items-center px-4 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{r.step}</p>
                    <p className="text-[10px] text-slate-500">{r.note}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-400">{r.val}</span>
                </CardInner>
              ))}
            </div>
          </div>

          {/* Break-even */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-3">Break-Even Analysis</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Break-even riders", value: `${breakEvenRiders}`, sub: "At Standard tier for 1 trigger/week", color: "#38bdf8" },
                { label: "Current pool size", value: `${ACTUARIAL.poolRiders}`, sub: `${Math.round((ACTUARIAL.poolRiders / breakEvenRiders) * 100)}% above break-even`, color: "#10b981" },
                { label: "Admin cost ratio",  value: "4.8%", sub: "Industry avg: 28–32%", color: "#a78bfa" },
                { label: "Unicorn threshold", value: "10,000", sub: "Riders for Series A viability", color: "#f59e0b" },
              ].map(s => (
                <CardInner key={s.label} className="p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
                </CardInner>
              ))}
            </div>
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Scalability:</strong> Each new zone adds ~340 riders.
              At 5 zones (1,700 riders) GigShield covers burn with a <strong className="text-emerald-400">35% margin</strong>.
              Admin automation keeps cost at 5% vs industry 30%, enabling micro-premiums to remain viable.
            </div>
          </div>

          {/* Zone risk comparison */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-4">Zone Risk Matrix</h3>
            <div className="flex flex-col gap-2.5">
              {ZONES.map(z => (
                <div key={z.id} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <p className="text-xs font-semibold text-slate-200">{z.name}</p>
                    <p className="text-[10px] text-slate-500">{z.city}</p>
                  </div>
                  <div className="flex-1">
                    <ProgressBar value={z.riskScore} max={100} color={z.riskScore > 75 ? "#f43f5e" : z.riskScore > 60 ? "#f59e0b" : "#10b981"} />
                  </div>
                  <span className="text-xs font-mono font-bold w-12 text-right" style={{ color: z.riskScore > 75 ? "#f43f5e" : z.riskScore > 60 ? "#f59e0b" : "#10b981" }}>
                    {z.riskScore}/100
                  </span>
                  <span className="text-[10px] text-slate-500 w-14 text-right">₹{calcZonePremium(z)}/wk</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-3">Higher risk score → higher dynamic premium via AI regression model</p>
          </div>
        </div>
      )}

      {/* ── Fraud ── */}
      {tab === "fraud" && (
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-sm font-bold tracking-widest uppercase">Active Fraud Flags</h3>
              <Badge variant="red">{fraudFlags.filter(f => f.severity === "high").length} High Severity</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {fraudFlags.map(f => (
                <CardInner key={f.id} className={`p-4 ${f.severity === "high" ? "border-rose-500/30 bg-rose-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldOff size={14} className={f.severity === "high" ? "text-rose-400" : "text-amber-400"} />
                      <span className="font-mono text-xs text-slate-300">{f.id}</span>
                      <Badge variant={f.severity === "high" ? "red" : "amber"} className="text-[9px]">{f.severity}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{f.time}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 mb-0.5">{f.reason}</p>
                  <p className="text-xs text-slate-500">Zone: {f.zone} · Payout blocked · Under review</p>
                </CardInner>
              ))}
            </div>
          </div>

          {/* Isolation forest stat */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-4">Isolation Forest — This Week</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Claims analyzed",  value: "1,247", color: "#38bdf8" },
                { label: "Flagged",          value: "31",    color: "#f59e0b" },
                { label: "Confirmed fraud",  value: "8",     color: "#f43f5e" },
                { label: "Saved (est.)",     value: "₹2.2K", color: "#10b981" },
              ].map(s => (
                <CardInner key={s.label} className="p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
                  <p className="font-display text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </CardInner>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Triggers ── */}
      {tab === "triggers" && (
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-sm font-bold tracking-widest uppercase mb-4">Trigger Performance — 6 Weeks</h3>
            <div className="flex flex-col gap-3">
              {TRIGGERS.map(trig => {
                const fires    = Math.floor(Math.random() * 8) + 2;
                const payouts  = fires * Math.floor(280 * trig.payoutMult);
                return (
                  <CardInner key={trig.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{trig.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold">{trig.label}</p>
                          <p className="text-[10px] text-slate-500">{trig.source} · threshold: {trig.threshold}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold" style={{ color: trig.color }}>{fires}×</p>
                        <p className="text-[10px] text-slate-500">fires</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Total paid out: <strong className="text-slate-200">₹{payouts}</strong></span>
                      <span>Payout mult: <strong className="text-slate-200">{trig.payoutMult}×</strong></span>
                      <Badge variant="gray" className="text-[9px]">AUTO</Badge>
                    </div>
                  </CardInner>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calcZonePremium(zone) {
  const base = 49;
  return Math.round(base * (zone.basePremiumMult ?? 1));
}
