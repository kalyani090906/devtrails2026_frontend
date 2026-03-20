import React, { useEffect, useRef, useState } from "react";
import { Shield, Activity, CreditCard, Lock, Home, AlertTriangle } from "lucide-react";
import { TIERS, TRIGGERS, FRAUD_CHECKS, ZONES } from "../data/constants";
import { getRainfall, getAQI, getOrderVolume, getTemp } from "../utils/sensors";
import { Badge, Btn, Card, CardInner, CircularProgress, ProgressBar } from "./ui/primitives";
import { useToast } from "./ui/Toast";
import LiveMonitor from "./LiveMonitor";
import PayoutModal from "./PayoutModal";

const TABS = [
  { id: "dashboard", label: "Dashboard",    Icon: Home     },
  { id: "monitor",   label: "Live Monitor", Icon: Activity },
  { id: "claims",    label: "Claims",       Icon: CreditCard },
  { id: "fraud",     label: "Anti-Fraud",   Icon: Lock     },
];

export default function Dashboard({ rider }) {
  const toast         = useToast();
  const tierData      = TIERS.find(t => t.id === rider.tier);
  const [tab, setTab] = useState("dashboard");

  const [sensors, setSensors]         = useState({ rain: 4, aqi: 90, orders: 82, temp: 30 });
  const [activeTrigger, setActive]    = useState(null);
  const [showPayout, setShowPayout]   = useState(false);
  const [payoutAmt, setPayoutAmt]     = useState(0);
  const [payoutLabel, setPayoutLabel] = useState("");
  const [claims, setClaims]           = useState([]);
  const [weeklyPaid, setWeeklyPaid]   = useState(0);
  const [fraudMode, setFraudMode]     = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      setSensors({
        rain: getRainfall(rider.zone, activeTrigger),
        aqi:  getAQI(rider.zone, activeTrigger),
        orders: getOrderVolume(activeTrigger),
        temp: getTemp(rider.zone),
      });
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeTrigger, rider.zone]);

  const fireTrigger = (trig) => {
    if (activeTrigger) return;
    setActive(trig.id);
    toast(`⚡ TRIGGER FIRED — ${trig.label}. Initiating claim verification…`, "amber", 5000);
    setTimeout(() => {
      if (fraudMode) {
        toast("🚨 FRAUD DETECTED — Mock location enabled. Shield suspended.", "red", 6000);
        setActive(null);
      } else {
        const amt = Math.round(tierData.dailyPayout * trig.payoutMult);
        setPayoutAmt(amt);
        setPayoutLabel(trig.label);
        setShowPayout(true);
      }
    }, 1600);
  };

  const handlePayoutClose = () => {
    setShowPayout(false);
    setClaims(p => [{
      id: `GS-${String(Date.now()).slice(-6)}`,
      trigger: payoutLabel, amount: payoutAmt,
      time: new Date().toLocaleTimeString(), status: "Settled",
    }, ...p]);
    setWeeklyPaid(p => p + payoutAmt);
    setActive(null);
    toast(`✅ ₹${payoutAmt} credited to your UPI wallet!`, "green");
  };

  const remaining = Math.max(0, tierData.maxPayout - weeklyPaid);

  return (
    <div className="min-h-screen flex flex-col bg-bg grid-bg">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-[60px] px-5 flex items-center justify-between border-b border-border bg-bg/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Shield size={17} className="text-amber-400" />
          </div>
          <span className="font-display text-xl font-bold text-amber-400 tracking-wide">GigShield</span>
          <Badge variant={activeTrigger ? "red" : "green"} className="ml-1">
            <span className={`w-1.5 h-1.5 rounded-full ${activeTrigger ? "bg-rose-400 animate-pulse" : "bg-emerald-400"}`} />
            {activeTrigger ? "TRIGGERED" : "PROTECTED"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-slate-400">
            {rider.avatar} <strong className="text-slate-200">{rider.name}</strong>
          </span>
          <Badge variant="amber">{tierData.name}</Badge>
        </div>
      </header>

      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <nav className="px-4 py-2.5 border-b border-border flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-widest transition-all whitespace-nowrap
              ${tab === id
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface2"}`}>
            <Icon size={12} />
            {label}{id === "claims" && claims.length > 0 ? ` (${claims.length})` : ""}
          </button>
        ))}
      </nav>

      {/* ── Body ─────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 max-w-[900px] w-full mx-auto">

        {/* ═══ DASHBOARD ════════════════════════════════════════ */}
        {tab === "dashboard" && (
          <div className="flex flex-col gap-5 animate-fade-up">
            {/* Alert banner */}
            {activeTrigger && (
              <div className="flex items-center gap-3 px-4 py-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl">
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                <div>
                  <p className="font-bold text-rose-400 text-sm">TRIGGER ACTIVE — Payout Initiated</p>
                  <p className="text-xs text-slate-400 mt-0.5">Verifying presence automatically. No action needed from you.</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Coverage Left",  value: `₹${remaining}`, sub: `of ₹${tierData.maxPayout}/wk`, color: "#10b981", bar: remaining / tierData.maxPayout },
                { label: "Paid Out",       value: `₹${weeklyPaid}`, sub: `${claims.length} claim${claims.length !== 1 ? "s" : ""}`, color: "#f59e0b", bar: weeklyPaid / tierData.maxPayout },
                { label: "Trust Score",    value: fraudMode ? "12" : "94", sub: fraudMode ? "⚠ Suspicious" : "✓ Excellent", color: fraudMode ? "#f43f5e" : "#38bdf8", bar: (fraudMode ? 12 : 94) / 100 },
                { label: "Weekly Premium", value: `₹${tierData.premium}`, sub: "Renews Sunday", color: "#a78bfa", bar: 1 },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-2">{s.label}</p>
                  <p className="font-display text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-slate-500 mb-2">{s.sub}</p>
                  <ProgressBar value={s.bar * 100} max={100} color={s.color} />
                </div>
              ))}
            </div>

            {/* Trigger simulator */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display text-base font-bold tracking-widest uppercase">Simulate Disruption</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Trigger parametric events to see the full payout flow</p>
                </div>
                <Badge variant="blue">Demo Mode</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TRIGGERS.map(trig => (
                  <button key={trig.id}
                    onClick={() => fireTrigger(trig)}
                    disabled={!!activeTrigger}
                    className="p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      borderColor: activeTrigger === trig.id ? trig.color : "#232d3f",
                      background:  activeTrigger === trig.id ? `${trig.color}18` : "#161b24",
                      opacity:     activeTrigger && activeTrigger !== trig.id ? 0.35 : 1,
                    }}>
                    <div className="text-2xl mb-2.5">{trig.emoji}</div>
                    <p className="font-bold text-sm text-slate-100 mb-1">{trig.label}</p>
                    <p className="text-xs text-slate-500 mb-3">{trig.detail}</p>
                    <p className="text-xs font-semibold" style={{ color: trig.color }}>
                      → Payout ₹{Math.round(tierData.dailyPayout * trig.payoutMult)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold tracking-widest uppercase mb-4">Recent Activity</h3>
              {claims.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <Shield size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No claims yet — your shield is active and monitoring.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {claims.map(c => (
                    <CardInner key={c.id} className="flex justify-between items-center p-3.5">
                      <div>
                        <p className="font-semibold text-sm mb-0.5">{c.trigger}</p>
                        <p className="text-xs text-slate-500 font-mono">{c.id} · {c.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-emerald-400">₹{c.amount}</p>
                        <Badge variant="green" className="text-[9px] mt-0.5">✓ Settled</Badge>
                      </div>
                    </CardInner>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ LIVE MONITOR ════════════════════════════════════ */}
        {tab === "monitor" && (
          <div className="animate-fade-up">
            <LiveMonitor zone={rider.zone} activeTrigger={activeTrigger} sensors={sensors} />
          </div>
        )}

        {/* ═══ CLAIMS ══════════════════════════════════════════ */}
        {tab === "claims" && (
          <div className="bg-surface border border-border rounded-xl p-5 animate-fade-up">
            <h3 className="font-display text-base font-bold tracking-widest uppercase mb-1">Claim History</h3>
            <p className="text-xs text-slate-500 mb-5">Zero-touch automatic claims — no paperwork, no phone calls.</p>
            {claims.length === 0 ? (
              <div className="text-center py-14 text-slate-600">
                <div className="text-5xl mb-4">🛡️</div>
                <p className="text-sm">No claims yet. Head to Dashboard and fire a trigger scenario.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {claims.map((c, i) => (
                  <CardInner key={c.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm mb-0.5">{c.trigger}</p>
                        <p className="text-xs text-slate-500 font-mono">Claim {c.id}</p>
                      </div>
                      <Badge variant="green">✓ {c.status}</Badge>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Payout</p>
                        <p className="font-display text-2xl font-bold text-emerald-400">₹{c.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Settlement</p>
                        <p className="text-sm text-slate-200">{c.time}</p>
                        <p className="text-xs text-emerald-400">Via UPI · &lt;4 min</p>
                      </div>
                    </div>
                  </CardInner>
                ))}

                {weeklyPaid > 0 && (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
                    <span className="font-semibold text-amber-400">Total This Week</span>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold text-amber-400">₹{weeklyPaid}</p>
                      <p className="text-xs text-slate-400">Net benefit: ₹{weeklyPaid - tierData.premium}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ ANTI-FRAUD ══════════════════════════════════════ */}
        {tab === "fraud" && (
          <div className="flex flex-col gap-4 animate-fade-up">
            {/* Fraud toggle */}
            <div className="bg-surface border border-rose-500/25 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-rose-400 tracking-widest uppercase">🔴 Fraud Simulation</h3>
                  <p className="text-xs text-slate-400 mt-1">Toggle GPS spoofing and watch GigShield detect it in real time.</p>
                </div>
                <Btn variant={fraudMode ? "danger" : "ghost"} onClick={() => {
                  setFraudMode(f => !f);
                  toast(fraudMode ? "Fraud mode disabled. Trust score restored." : "🚨 Mock Location detected! Shield suspended.", fraudMode ? "green" : "red");
                }}>
                  {fraudMode ? "🚨 SPOOFING ACTIVE" : "Simulate Spoof"}
                </Btn>
              </div>
              {fraudMode && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-slate-300 leading-relaxed space-y-1">
                  <p>⚠ Developer Options: <strong className="text-rose-400">Enabled</strong></p>
                  <p>⚠ Mock Location permission: <strong className="text-rose-400">ON</strong></p>
                  <p>⚠ Accelerometer: <strong className="text-rose-400">Static (no bike vibration signature)</strong></p>
                  <p>⚠ Network: Home WiFi vs GPS "Koramangala" — <strong className="text-rose-400">mismatch</strong></p>
                </div>
              )}
            </div>

            {/* Checks */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold tracking-widest uppercase mb-4">Multi-Factor Proof-of-Presence</h3>
              <div className="flex flex-col gap-3">
                {FRAUD_CHECKS.map((m, i) => {
                  const passing = i < 3 ? !fraudMode : true;
                  return (
                    <CardInner key={m.label} className={`flex gap-3.5 p-3.5 items-start transition-all ${!passing ? "border-rose-500/30 bg-rose-500/5" : ""}`}>
                      <span className="text-xl shrink-0">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold">{m.label}</p>
                          <Badge variant={passing ? "green" : "red"} className="text-[9px] shrink-0 ml-2">
                            {passing ? "✓ PASS" : "✗ FAIL"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{m.detail}</p>
                      </div>
                    </CardInner>
                  );
                })}
              </div>
            </div>

            {/* Trust score */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold tracking-widest uppercase mb-4">Trust Score</h3>
              <div className="flex items-center gap-6">
                <CircularProgress value={fraudMode ? 12 : 94} max={100} color={fraudMode ? "#f43f5e" : "#10b981"} size={100} />
                <div>
                  <p className="font-display text-3xl font-bold mb-1" style={{ color: fraudMode ? "#f43f5e" : "#10b981" }}>
                    {fraudMode ? 12 : 94}<span className="text-slate-500 text-xl">/100</span>
                  </p>
                  <p className="text-sm text-slate-400 mb-3">
                    {fraudMode ? "Suspicious activity — Shield suspended" : "Excellent standing — Benefit of Doubt active"}
                  </p>
                  {!fraudMode && <Badge variant="amber">⭐ Veteran Rider · 6 months clean</Badge>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-5 py-3 border-t border-border flex justify-between items-center">
        <span className="text-[11px] text-slate-600 font-mono">GigShield v1.0 · Innovatrix · Amrita, Bengaluru</span>
        <span className="text-[11px] text-slate-600">Guidewire DEVTrails 2026</span>
      </footer>

      {showPayout && <PayoutModal amount={payoutAmt} trigger={payoutLabel} onClose={handlePayoutClose} />}
    </div>
  );
}
