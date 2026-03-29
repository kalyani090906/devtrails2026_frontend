import React, { useState } from "react";
import { Shield, RefreshCw, TrendingUp, XCircle, CheckCircle, Cpu } from "lucide-react";
import { TIERS, ZONES } from "../data/constants";
import { calcDynamicPremium } from "../utils/sensors";
import { Badge, Btn, CardInner, ProgressBar } from "./ui/primitives";
import { useToast } from "./ui/Toast";

const STATUS_STEPS = ["Active", "Renewal Due", "Expired", "Cancelled"];

export default function PolicyPage({ rider, onTierChange }) {
  const toast       = useToast();
  const tierData    = TIERS.find(t => t.id === rider.tier);
  const zone        = ZONES.find(z => z.id === rider.zone);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [cancelling,  setCancelling]  = useState(false);

  const dynPremium = calcDynamicPremium(tierData.premium, zone, rider.platform === "Swiggy");

  const policyStart = new Date();
  policyStart.setDate(policyStart.getDate() - policyStart.getDay()); // last Sunday
  const policyEnd = new Date(policyStart);
  policyEnd.setDate(policyEnd.getDate() + 6);

  const daysLeft = Math.max(0, Math.ceil((policyEnd - new Date()) / 86400000));
  const weekProgress = Math.round(((7 - daysLeft) / 7) * 100);

  const handleUpgrade = (newTier) => {
    onTierChange(newTier);
    setShowUpgrade(false);
    toast(`✅ Upgraded to ${TIERS.find(t => t.id === newTier).name} — effective immediately!`, "green");
  };

  const handleRenew = () => {
    toast(`🔄 Policy renewed for next week. ₹${dynPremium} will be debited Sunday midnight.`, "amber");
  };

  const handleCancel = () => {
    setCancelling(true);
    setTimeout(() => {
      setCancelling(false);
      toast("Policy cancellation requested. Coverage ends this Sunday.", "red");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-up">

      {/* Policy Card */}
      <div className="bg-surface border border-border rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: tierData.color, transform: "translate(30%, -30%)" }} />
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Active Policy</p>
            <h2 className="font-display text-2xl font-bold" style={{ color: tierData.color }}>
              GigShield {tierData.name}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{rider.platform} · {zone?.name}, {zone?.city}</p>
          </div>
          <Badge variant="green">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </Badge>
        </div>

        {/* Policy details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Rider ID",        value: rider.riderId,           mono: true },
            { label: "Weekly Premium",  value: `₹${dynPremium}`,        color: tierData.color },
            { label: "Max Payout",      value: `₹${tierData.maxPayout}/wk` },
            { label: "Daily Cover",     value: `₹${tierData.dailyPayout}` },
          ].map(d => (
            <CardInner key={d.label} className="p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{d.label}</p>
              <p className={`font-bold text-sm ${d.mono ? "font-mono" : ""}`} style={{ color: d.color || "inherit" }}>
                {d.value}
              </p>
            </CardInner>
          ))}
        </div>

        {/* Policy period */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Policy period: {policyStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {policyEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            <span>{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining</span>
          </div>
          <ProgressBar value={weekProgress} max={100} color={tierData.color} />
        </div>

        {/* Active triggers */}
        <div className="mb-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Covered triggers</p>
          <div className="flex flex-wrap gap-1.5">
            {["Heavy Rainfall", "Severe AQI", "Civil Disruption", "Extreme Heat", "Flash Flood"].map(t => (
              <Badge key={t} variant="amber" className="text-[9px]">✓ {t}</Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2.5">
          <Btn variant="primary" onClick={handleRenew}>
            <RefreshCw size={13} /> Renew Policy
          </Btn>
          <Btn variant="ghost" onClick={() => setShowUpgrade(v => !v)}>
            <TrendingUp size={13} /> Upgrade Tier
          </Btn>
          <Btn variant="danger" onClick={handleCancel}>
            {cancelling ? "Processing…" : <><XCircle size={13} /> Cancel</>}
          </Btn>
        </div>
      </div>

      {/* Tier upgrade panel */}
      {showUpgrade && (
        <div className="bg-surface border border-amber-500/25 rounded-xl p-5 animate-fade-up">
          <h3 className="font-display text-base font-bold tracking-widest uppercase mb-1">Change Coverage Tier</h3>
          <p className="text-xs text-slate-500 mb-4">Upgrades take effect immediately. Downgrades apply next renewal.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TIERS.map(t => {
              const dp = calcDynamicPremium(t.premium, zone, rider.platform === "Swiggy");
              const isCurrent = t.id === rider.tier;
              return (
                <div key={t.id} onClick={() => !isCurrent && handleUpgrade(t.id)}
                  className={`p-4 rounded-xl border transition-all ${isCurrent
                    ? "opacity-50 cursor-not-allowed border-border2 bg-surface2"
                    : "cursor-pointer hover:scale-[1.02] border-border2 hover:border-amber-500/40 bg-surface2"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-display font-bold text-base" style={{ color: t.color }}>{t.name}</span>
                    {isCurrent && <Badge variant="gray" className="text-[9px]">Current</Badge>}
                  </div>
                  <p className="font-mono text-lg font-bold text-slate-100 mb-1">₹{dp}<span className="text-xs text-slate-500">/wk</span></p>
                  <p className="text-xs text-slate-500">Max payout: ₹{t.maxPayout}/wk</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Premium Breakdown */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={15} className="text-sky-400" />
          <h3 className="font-display text-base font-bold tracking-widest uppercase">AI Premium Breakdown</h3>
          <Badge variant="blue">Dynamic</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-3">Risk factors for {zone?.name}</p>
            {[
              { label: "Zone risk score",       value: `${zone?.riskScore ?? 65}/100`,      bar: zone?.riskScore ?? 65, color: "#f59e0b" },
              { label: "Avg trigger days/month", value: `${zone?.triggerFreq ?? 3} days`,    bar: ((zone?.triggerFreq ?? 3) / 6) * 100, color: "#38bdf8" },
              { label: "Avg AQI",               value: `${zone?.aqiAvg ?? 100}`,             bar: Math.min((zone?.aqiAvg ?? 100) / 300, 1) * 100, color: "#a78bfa" },
              { label: "Monsoon rain days",     value: `${zone?.rainDays ?? 3}/month`,       bar: ((zone?.rainDays ?? 3) / 6) * 100, color: "#06b6d4" },
            ].map(r => (
              <div key={r.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{r.label}</span>
                  <span className="font-mono font-bold text-slate-200">{r.value}</span>
                </div>
                <ProgressBar value={r.bar} max={100} color={r.color} />
              </div>
            ))}
          </div>

          <CardInner className="p-4 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-3">Premium calculation</p>
              {[
                ["Base premium",        `₹${tierData.premium}`],
                ["Zone risk multiplier", `×${(zone?.basePremiumMult ?? 1).toFixed(2)}`],
                ["Platform discount",   rider.platform === "Swiggy" ? "−5%" : "—"],
                ["AI adjustment",       `+₹${dynPremium - tierData.premium}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-border text-xs last:border-0">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-mono font-semibold text-slate-200">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-amber-500/30">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-amber-400">Your weekly premium</span>
                <span className="font-display text-2xl font-bold text-amber-400">₹{dynPremium}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Recalculated every Sunday based on next-week forecast</p>
            </div>
          </CardInner>
        </div>
      </div>

      {/* Coverage scope notice */}
      <CardInner className="p-4 border-slate-600/30">
        <div className="flex gap-3 items-start">
          <CheckCircle size={15} className="text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-200 mb-1">Coverage scope — Income protection only</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              GigShield covers <strong className="text-slate-300">lost income</strong> during external disruptions only.
              Vehicle repairs, health/accident cover, and medical bills are strictly excluded as per IRDAI guidelines.
            </p>
          </div>
        </div>
      </CardInner>
    </div>
  );
}
