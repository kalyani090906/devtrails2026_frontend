import React, { useState } from "react";
import { Shield, Zap, Cpu } from "lucide-react";
import { TIERS, ZONES } from "../data/constants";
import { calcDynamicPremium } from "../utils/sensors";
import { Badge, Btn, CardInner, StepIndicator } from "./ui/primitives";
import { useToast } from "./ui/Toast";

const STEPS = ["Identity", "Coverage", "Activate"];

export default function Onboarding({ onComplete }) {
  const toast = useToast();
  const [step, setStep]           = useState(0);
  const [name, setName]           = useState("Ravi Kumar");
  const [riderId, setRiderId]     = useState("SW-BLR-2847");
  const [platform, setPlatform]   = useState("Swiggy");
  const [zone, setZone]           = useState("koramangala");
  const [tier, setTier]           = useState("standard");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified]   = useState(false);

  const selectedZone = ZONES.find(z => z.id === zone);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      toast("Swiggy account verified ✓ — Avg. earnings ₹620/day synced", "green");
    }, 2000);
  };

  const handleActivate = () => {
    const dp = calcDynamicPremium(TIERS.find(t => t.id === tier).premium, selectedZone, platform === "Swiggy");
    toast(`🎉 GigShield activated! ₹${dp} debited. Your shield is LIVE.`, "green", 5000);
    setTimeout(() => onComplete({ name, riderId, platform, zone, tier, dynPremium: dp }), 600);
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-4 py-10">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Shield className="text-amber-400" size={26} />
        </div>
        <div>
          <p className="font-display text-3xl font-bold text-amber-400 leading-none tracking-wide">GigShield</p>
          <p className="text-[11px] text-slate-500 tracking-[0.14em] uppercase mt-0.5">Parametric Income Protection</p>
        </div>
      </div>

      <div className="mb-8">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <div className="w-full max-w-[460px] bg-surface border border-border rounded-2xl p-7 animate-fade-up shadow-[0_0_60px_rgba(0,0,0,0.6)]">

        {/* ─── Step 0: Identity ─────────────────── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">Rider Identity</h2>
              <p className="text-sm text-slate-400">Link your delivery partner account to activate protection.</p>
            </div>
            {[{ label: "Full Name", val: name, set: setName }, { label: "Partner ID", val: riderId, set: setRiderId }].map(f => (
              <div key={f.label}>
                <label className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface2 border border-border2 rounded-lg text-sm text-slate-100 outline-none focus:border-amber-500/50 transition-colors font-mono" />
              </div>
            ))}
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1.5">Platform</label>
              <div className="grid grid-cols-2 gap-2.5">
                {["Swiggy", "Zomato"].map(p => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={`py-2.5 rounded-lg border font-display font-bold text-sm tracking-widest uppercase transition-all
                      ${platform === p ? "bg-amber-500/10 border-amber-500/40 text-amber-400" : "bg-surface2 border-border2 text-slate-400 hover:border-slate-500"}`}>
                    {p === "Swiggy" ? "🧡" : "❤️"} {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1.5">Delivery Zone</label>
              <select value={zone} onChange={e => setZone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface2 border border-border2 rounded-lg text-sm text-slate-100 outline-none focus:border-amber-500/50 transition-colors">
                {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}, {z.city} — Risk {z.riskScore}/100</option>)}
              </select>
            </div>
            {!verified ? (
              <button onClick={handleVerify} disabled={verifying}
                className="w-full py-2.5 border border-border2 bg-surface2 rounded-lg text-sm text-slate-300 font-display font-bold tracking-widest uppercase hover:border-amber-500/40 hover:text-amber-400 transition-all flex items-center justify-center gap-2">
                {verifying ? <><span className="inline-block animate-spin">⟳</span> Verifying…</> : <><Zap size={14} /> Verify & Link Account</>}
              </button>
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <span className="text-emerald-400">✓</span>
                <span className="text-sm text-emerald-400">Verified — Avg. earnings: ₹620/day synced</span>
              </div>
            )}
            <Btn variant="primary" className="w-full justify-center" onClick={() => setStep(1)}>Continue →</Btn>
          </div>
        )}

        {/* ─── Step 1: Coverage ─────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">Choose Coverage</h2>
              <p className="text-sm text-slate-400">AI recommends <span className="text-amber-400 font-semibold">Standard</span> based on your zone's risk profile.</p>
            </div>
            {TIERS.map(t => {
              const dp = calcDynamicPremium(t.premium, selectedZone, platform === "Swiggy");
              const diff = dp - t.premium;
              return (
                <div key={t.id} onClick={() => setTier(t.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${tier === t.id ? `${t.bg} ${t.border}` : "bg-surface2 border-border2 hover:border-slate-500"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full transition-all" style={{ background: t.color, boxShadow: tier === t.id ? `0 0 8px ${t.color}` : "none" }} />
                      <span className={`font-display text-lg font-bold ${tier === t.id ? t.tw : "text-slate-200"}`}>{t.name}</span>
                      {t.id === "standard" && <Badge variant="amber" className="text-[9px]">AI Pick</Badge>}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-base font-bold text-slate-100">₹{dp}<span className="text-xs text-slate-500">/wk</span></span>
                      {diff !== 0 && (
                        <p className="text-[10px]" style={{ color: diff > 0 ? "#f59e0b" : "#10b981" }}>
                          {diff > 0 ? `+₹${diff}` : `−₹${Math.abs(diff)}`} AI adjustment
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 text-xs text-slate-400">
                    <span>Max: <strong className="text-slate-200">₹{t.maxPayout}/wk</strong></span>
                    <span>Daily: <strong className="text-slate-200">₹{t.dailyPayout}</strong></span>
                  </div>
                </div>
              );
            })}

            {/* AI Forecast */}
            <CardInner className="p-3.5 border-sky-500/30 bg-sky-500/5">
              <div className="flex gap-2.5 items-start">
                <Cpu size={15} className="text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-sky-400 mb-1">AI Risk Forecast — {selectedZone?.name}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Risk score <strong className="text-slate-200">{selectedZone?.riskScore}/100</strong> · 
                    Avg {selectedZone?.triggerFreq} trigger days/month · 
                    Premium adjusted to <strong className="text-amber-400">₹{calcDynamicPremium(TIERS.find(t=>t.id===tier).premium, selectedZone, platform==="Swiggy")}/wk</strong>
                  </p>
                </div>
              </div>
            </CardInner>

            <div className="grid grid-cols-2 gap-3">
              <Btn variant="ghost" className="justify-center" onClick={() => setStep(0)}>← Back</Btn>
              <Btn variant="primary" className="justify-center" onClick={() => setStep(2)}>Select →</Btn>
            </div>
          </div>
        )}

        {/* ─── Step 2: Activate ─────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">Activate Shield</h2>
              <p className="text-sm text-slate-400">Review your coverage and pay the first week's premium.</p>
            </div>
            <CardInner className="p-4">
              {[
                ["Rider", name],
                ["Partner ID", riderId],
                ["Platform", platform],
                ["Zone", `${selectedZone?.name}, ${selectedZone?.city}`],
                ["Zone Risk Score", `${selectedZone?.riskScore}/100`],
                ["Tier", TIERS.find(t => t.id === tier)?.name],
                ["AI-Adjusted Premium", `₹${calcDynamicPremium(TIERS.find(t=>t.id===tier).premium, selectedZone, platform==="Swiggy")}/wk`],
                ["Max Weekly Payout", `₹${TIERS.find(t => t.id === tier)?.maxPayout}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className="text-sm font-semibold text-slate-100">{v}</span>
                </div>
              ))}
            </CardInner>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-2.5">5 Active Triggers Covered</p>
              <div className="flex flex-wrap gap-1.5">
                {["Heavy Rain >15mm/hr", "Severe AQI >300", "Civil Disruption", "Extreme Heat >44°C", "Flash Flood (IMD Red)"].map(t => (
                  <Badge key={t} variant="amber" className="text-[9px]">✓ {t}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Btn variant="ghost" className="justify-center" onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="primary" className="justify-center" onClick={handleActivate}><Zap size={13} /> Pay & Activate</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
