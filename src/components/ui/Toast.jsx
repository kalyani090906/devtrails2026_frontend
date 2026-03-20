import React, { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type = "amber", duration = 4500) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  }, []);

  const icons = { amber: "⚡", green: "✅", red: "🚨", blue: "ℹ️" };
  const borders = { amber: "border-amber-500/40", green: "border-emerald-500/40", red: "border-rose-500/40", blue: "border-sky-500/40" };

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div className="fixed top-[72px] right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className={`animate-slide-in pointer-events-auto min-w-[280px] max-w-[340px] bg-surface2 border ${borders[t.type]} rounded-xl p-3.5 shadow-2xl`}>
            <div className="flex gap-2.5 items-start">
              <span className="text-lg leading-none mt-0.5">{icons[t.type]}</span>
              <span className="text-sm leading-relaxed text-slate-200">{t.msg}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
