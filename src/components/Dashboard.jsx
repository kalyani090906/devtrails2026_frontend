import React, { useEffect, useRef, useState } from "react";
import { Shield, Activity, CreditCard, Lock, Home, AlertTriangle, FileText, BarChart2 } from "lucide-react";
import { TIERS, TRIGGERS, FRAUD_CHECKS, ZONES } from "../data/constants";
import { getRainfall, getAQI, getOrderVolume, getTemp } from "../utils/sensors";
import { Badge, Btn, CardInner, CircularProgress, ProgressBar } from "./ui/primitives";
import { useToast } from "./ui/Toast";
import { saveState, loadState } from "../utils/storage";
import LiveMonitor from "./LiveMonitor";
import PayoutModal from "./PayoutModal";
import PolicyPage from "./PolicyPage";
import AdminDashboard from "./AdminDashboard";

const TABS = [
  { id: "dashboard", label: "Dashboard",    Icon: Home       },
  { id: "monitor",   label: "Live Monitor", Icon: Activity   },
  { id: "policy",    label: "My Policy",    Icon: FileText   },
  { id: "claims",    label: "Claims",       Icon: CreditCard },
  { id: "fraud",     label: "Anti-Fraud",   Icon: Lock       },
  { id: "admin",     label: "Admin",        Icon: BarChart2  },
];

// Claim status lifecycle
const CLAIM_STATUSES = ["Pending", "Verifying", "Approved", "Paid"];

export default function Dashboard({ rider: initialRider }) {
  const toast = useToast();

  // Load persisted state or use defaults
  const saved = loadState();
  const [rider, setRider]             = useState(saved?.rider || initialRider);
  const [tab, setTab]                 = useState("dashboard");
  const [sensors, setSensors]         = useState({ rain: 4, aqi: 90, orders: 82, temp: 30 });
  const [activeTrigger, setActive]    = useState(null);
  const [showPayout, setShowPayout]   = useState(false);
  const [payoutAmt, setPayoutAmt]     = useState(0);
  const [payoutLabel, setPayoutLabel] = useState("");
  const [claims, setClaims]           = useState(saved?.claims || []);
  const [weeklyPaid, setWeeklyPaid]   = useState(saved?.weeklyPaid || 0);
  const [fraudMode, setFraudMode]     = useState(false);
  const pollRef = useRef(null);

  const tierData = TIERS.find(t => t.id === rider.tier) || TIERS[1];

  // Persist state on changes
  useEffect(() => {
    saveState({ rider, claims, weeklyPaid });
  }, [rider, claims, weeklyPaid]);

  // Sensor polling
  useEffect(() => {
    pollRef.current = setInterval(() => {
      setSensors({
        rain:   getRainfall(rider.zone, activeTrigger),
        aqi:    getAQI(rider.zone, activeTrigger),
        orders: getOrderVolume(activeTrigger),
        temp:   getTemp(rider.zone, activeTrigger),
      });
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeTrigger, rider.zone]);

  // Advance claim statuses over time (lifecycle simulation)
  useEffect(() => {
    const t = setInterval(() => {
      setClaims(prev => prev.map(c => {
        const idx = CLAIM_STATUSES.indexOf(c.status);
        if (idx >= 0 && idx < CLAIM_STATUSES.length - 1) {
          return { ...c, status: CLAIM_STATUSES[idx + 1] };
        }
        return c;
      }));
    }, 8000);
    return () => clearInterval(t);
  }, []);

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
    const newClaim = {
      id: `GS-${String(Date.now()).slice(-6)}`,
      trigger: payoutLabel,
      amount: payoutAmt,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      status: "Pending",
    };
    setClaims(p => [newClaim, ...p]);
    setWeeklyPaid(p => p + payoutAmt);
    setActive(null);
    toast(`✅ ₹${payoutAmt} claim initiated — tracking in Claims tab`, "green");
  };

  const remaining = Math.max(0, tierData.maxPayout - weeklyPaid);

  const statusColor = { Pending: "#f59e0b", Verifying: "#38bdf8", Approved: "#a78bfa", Paid: "#10b981" };
  const statusVariant = { Pending: "amber", Verifying: "blue", Approved: "violet", Paid: "green" };

  return (
    <div className="min-h-screen flex flex-col bg-bg grid-bg">

      {/* ── Header ── */}
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

      {/* ── Tabs ── */}
      <nav className="px-4 py-2.5 border-b border-border flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-widest transition-all whitespace-nowrap
              ${tab === id
                ? id === "admin"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface2"}`}>
            <Icon size={12} />
            {label}{id === "claims" && claims.length > 0 ? ` (${claims.length})` : ""}
          </button>
        ))}
      </nav>

      {/* ── Body ── */}
      <main className="flex-1 px-4 py-5 max-w-[900px] w-full mx-auto">

        {/* ═══ DASHBOARD ══════════════════════════════════════ */}
        {tab === "dashboard" && (
          <div className="flex flex-col gap-5 animate-fade-up">
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
                { label: "Coverage Left",  value: `₹${remaining}`,     sub: `of ₹${tierData.maxPayout}/wk`,               color: "#10b981", bar: remaining / tierData.maxPayout },
                { label: "Paid Out",       value: `₹${weeklyPaid}`,    sub: `${claims.length} claim${claims.length !== 1 ? "s" : ""}`, color: "#f59e0b", bar: weeklyPaid / tierData.maxPayout },
                { label: "Trust Score",    value: fraudMode ? "12" : "94", sub: fraudMode ? "⚠ Suspicious" : "✓ Excellent", color: fraudMode ? "#f43f5e" : "#38bdf8", bar: (fraudMode ? 12 : 94) / 100 },
                { label: "AI Premium",     value: `₹${rider.dynPremium || tierData.premium}`, sub: "Dynamic this week",    color: "#a78bfa", bar: 1 },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-2">{s.label}</p>
                  <p className="font-display text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-slate-500 mb-2">{s.sub}</p>
                  <ProgressBar value={s.bar * 100} max={100} color={s.color} />
                </div>
              ))}
            </div>

            {/* 5 Trigger buttons */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display text-base font-bold tracking-widest uppercase">Simulate Disruption</h3>
                  <p className="text-xs text-slate-500 mt-0.5">5 parametric triggers — fire to see the full automated payout flow</p>
                </div>
                <Badge variant="blue">Demo Mode</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {TRIGGERS.map(trig => (
                  <button key={trig.id} onClick={() => fireTrigger(trig)} disabled={!!activeTrigger}
                    className="p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      borderColor: activeTrigger === trig.id ? trig.color : "#232d3f",
                      background:  activeTrigger === trig.id ? `${trig.color}18` : "#161b24",
                      opacity:     activeTrigger && activeTrigger !== trig.id ? 0.35 : 1,
                    }}>
                    <div className="text-xl mb-1.5">{trig.emoji}</div>
                    <p className="font-bold text-xs text-slate-100 mb-0.5 leading-tight">{trig.label}</p>
                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">{trig.detail}</p>
                    <p className="text-[10px] font-semibold" style={{ color: trig.color }}>
                      ₹{Math.round(tierData.dailyPayout * trig.payoutMult)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent claims preview */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-base font-bold tracking-widest uppercase">Recent Claims</h3>
                {claims.length > 0 && (
                  <button onClick={() => setTab("claims")} className="text-xs text-amber-400 hover:underline">View all →</button>
                )}
              </div>
              {claims.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <Shield size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No claims yet — your shield is active and monitoring.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {claims.slice(0, 3).map(c => (
                    <CardInner key={c.id} className="flex justify-between items-center p-3.5">
                      <div>
                        <p className="font-semibold text-sm mb-0.5">{c.trigger}</p>
                        <p className="text-xs text-slate-500 font-mono">{c.id} · {c.time}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-display text-xl font-bold text-emerald-400">₹{c.amount}</p>
                        <Badge variant={statusVariant[c.status] || "gray"} className="text-[9px]">{c.status}</Badge>
                      </div>
                    </CardInner>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ LIVE MONITOR ══════════════════════════════════ */}
        {tab === "monitor" && (
          <div className="animate-fade-up">
            <LiveMonitor zone={rider.zone} activeTrigger={activeTrigger} sensors={sensors} />
          </div>
        )}

        {/* ═══ MY POLICY ══════════════════════════════════════ */}
        {tab === "policy" && (
          <PolicyPage rider={rider} onTierChange={(newTier) => {
            setRider(r => ({ ...r, tier: newTier }));
            toast(`Tier updated to ${TIERS.find(t => t.id === newTier)?.name}`, "green");
          }} />
        )}

        {/* ═══ CLAIMS ════════════════════════════════════════ */}
        {tab === "claims" && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold tracking-widest uppercase mb-1">Claim History</h3>
              <p className="text-xs text-slate-500 mb-5">Zero-touch automatic claims — status updates every few seconds in demo.</p>

              {claims.length === 0 ? (
                <div className="text-center py-14 text-slate-600">
                  <div className="text-5xl mb-4">🛡️</div>
                  <p className="text-sm">No claims yet. Head to Dashboard and fire a trigger.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {claims.map(c => {
                    const statusIdx = CLAIM_STATUSES.indexOf(c.status);
                    return (
                      <CardInner key={c.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-sm mb-0.5">{c.trigger}</p>
                            <p className="text-xs text-slate-500 font-mono">Claim {c.id} · {c.date} {c.time}</p>
                          </div>
                          <Badge variant={statusVariant[c.status] || "gray"}>{c.status}</Badge>
                        </div>

                        {/* Status pipeline */}
                        <div className="flex items-center gap-0 mb-4">
                          {CLAIM_STATUSES.map((s, i) => (
                            <React.Fragment key={s}>
                              <div className="flex flex-col items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all
                                  ${i <= statusIdx ? "text-black" : "bg-border2 text-slate-600"}`}
                                  style={{ background: i <= statusIdx ? statusColor[c.status] : undefined }}>
                                  {i < statusIdx ? "✓" : i === statusIdx ? "●" : ""}
                                </div>
                                <span className={`text-[9px] mt-1 ${i === statusIdx ? "text-slate-200" : "text-slate-600"}`}>{s}</span>
                              </div>
                              {i < CLAIM_STATUSES.length - 1 && (
                                <div className="flex-1 h-0.5 mb-4 mx-1 transition-all" style={{ background: i < statusIdx ? statusColor[c.status] : "#1c2333" }} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <div className="flex justify-between pt-3 border-t border-border">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Payout</p>
                            <p className="font-display text-2xl font-bold text-emerald-400">₹{c.amount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Settlement</p>
                            <p className="text-sm text-slate-200">Via UPI</p>
                            <p className="text-xs text-emerald-400">{c.status === "Paid" ? "✓ Completed" : "In progress…"}</p>
                          </div>
                        </div>
                      </CardInner>
                    );
                  })}

                  {weeklyPaid > 0 && (
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-amber-400">Total This Week</span>
                        <p className="text-xs text-slate-400 mt-0.5">Net benefit: ₹{weeklyPaid - (rider.dynPremium || tierData.premium)}</p>
                      </div>
                      <p className="font-display text-2xl font-bold text-amber-400">₹{weeklyPaid}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ANTI-FRAUD ═════════════════════════════════════ */}
        {tab === "fraud" && (
          <div className="flex flex-col gap-4 animate-fade-up">
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
                  <p>⚠ Network: Home WiFi vs GPS zone — <strong className="text-rose-400">mismatch detected</strong></p>
                </div>
              )}
            </div>
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
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold tracking-widest uppercase mb-4">Trust Score</h3>
              <div className="flex items-center gap-6">
                <CircularProgress value={fraudMode ? 12 : 94} max={100} color={fraudMode ? "#f43f5e" : "#10b981"} size={100} />
                <div>
                  <p className="font-display text-3xl font-bold mb-1" style={{ color: fraudMode ? "#f43f5e" : "#10b981" }}>
                    {fraudMode ? 12 : 94}<span className="text-slate-500 text-xl">/100</span>
                  </p>
                  <p className="text-sm text-slate-400 mb-3">{fraudMode ? "Suspicious — Shield suspended" : "Excellent — Benefit of Doubt active"}</p>
                  {!fraudMode && <Badge variant="amber">⭐ Veteran Rider · 6 months clean</Badge>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ADMIN ══════════════════════════════════════════ */}
        {tab === "admin" && (
          <div className="animate-fade-up">
            <AdminDashboard allClaims={claims} />
          </div>
        )}

      </main>

      <footer className="px-5 py-3 border-t border-border flex justify-between items-center">
        <span className="text-[11px] text-slate-600 font-mono">GigShield v2.0 · Innovatrix · Amrita, Bengaluru</span>
        <span className="text-[11px] text-slate-600">Guidewire DEVTrails 2026 — Phase 2</span>
      </footer>

      {showPayout && <PayoutModal amount={payoutAmt} trigger={payoutLabel} onClose={handlePayoutClose} />}
    </div>
  );
}
