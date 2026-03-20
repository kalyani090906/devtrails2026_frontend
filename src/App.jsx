import React, { useState } from "react";
import { ToastProvider } from "./components/ui/Toast";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [rider, setRider] = useState(null);
  return (
    <ToastProvider>
      {!rider
        ? <Onboarding onComplete={(data) => setRider({ ...data, avatar: "🏍️" })} />
        : <Dashboard rider={rider} />
      }
    </ToastProvider>
  );
}
