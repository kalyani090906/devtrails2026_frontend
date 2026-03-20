import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Btn } from "./ui/primitives";

const STEPS = [
  { label: "Verifying Presence",    detail: "GPS + Accelerometer + Network fingerprint" },
  { label: "Fraud Check Passed",    detail: "No mock location. Device integrity confirmed." },
  { label: "Calculating Payout",    detail: "Trigger event × coverage tier multiplier" },
  { label: "UPI Transfer Initiated", detail: "Payment to ****2847@upi" },
];

export default function PayoutModal({ amount, trigger, onClose }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone]         = useState(false);
  const claimId = `GS-${String(Date.now()).slice(-6)}`;

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(2), 1800);
    const t2 = setTimeout(() => setProgress(4), 3600);
    const t3 = setTimeout(() => setDone(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[9000] p-4">
      <div className="w-full max-w-[400px] bg-surface border border-border rounded-2xl p-7 animate-fade-up shadow-[0_0_80px_rgba(0,0,0,0.8)]">

        {!done ? (
          <>
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-3 animate-pulse-amber">
                <Shield className="text-amber-400" size={26} />
              </div>
              <h3 className="font-display text-xl font-bold mb-1">Claim Processing</h3>
              <p className="text-xs text-slate-400">Adversarial verification in progress…</p>
            </div>
            <div className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500
                    ${i < progress ? "bg-emerald-500" : "bg-border2"}`}>
                    {i < progress
                      ? <span className="text-black text-xs font-bold">✓</span>
                      : <span className="w-2 h-2 rounded-full bg-slate-600 animate-blink block" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold transition-colors ${i < progress ? "text-slate-100" : "text-slate-500"}`}>{s.label}</p>
                    <p className="text-xs text-slate-600">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center animate-fade-up">
            <div className="text-5xl mb-4">💸</div>
            <p className="font-display text-3xl font-bold text-emerald-400 mb-1">₹{amount} Sent!</p>
            <p className="text-sm text-slate-400 mb-6">Transferred to your UPI in under 4 minutes</p>

            <div className="bg-surface2 border border-border2 rounded-xl p-4 mb-6 text-left">
              {[
                ["Trigger", trigger],
                ["Payout Amount", `₹${amount}`],
                ["Transfer Method", "UPI (Instant)"],
                ["Settlement Time", "3m 47s"],
                ["Claim ID", claimId],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className="text-xs font-semibold text-slate-100 font-mono">{v}</span>
                </div>
              ))}
            </div>

            <Btn variant="primary" className="w-full justify-center" onClick={onClose}>
              ✓ Done
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
