import React, { useState } from "react";
import { ToastProvider } from "./components/ui/Toast";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import { loadState } from "./utils/storage";

export default function App() {
  const saved = loadState();
  const [rider, setRider] = useState(saved?.rider || null);

  return (
    <ToastProvider>
      {!rider
        ? <Onboarding onComplete={(data) => setRider({ ...data, avatar: "🏍️" })} />
        : <Dashboard rider={rider} />
      }
    </ToastProvider>
  );
}
