export const TIERS = [
  { id: "basic",    name: "Basic",    premium: 29, maxPayout: 300,  dailyPayout: 100, color: "#64748b", tw: "text-slate-400",  border: "border-slate-600/40",  bg: "bg-slate-500/10" },
  { id: "standard", name: "Standard", premium: 49, maxPayout: 600,  dailyPayout: 280, color: "#f59e0b", tw: "text-amber-400",  border: "border-amber-500/40",  bg: "bg-amber-500/10" },
  { id: "plus",     name: "Plus",     premium: 79, maxPayout: 1000, dailyPayout: 400, color: "#38bdf8", tw: "text-sky-400",    border: "border-sky-500/40",    bg: "bg-sky-500/10"  },
];

export const ZONES = [
  { id: "koramangala", name: "Koramangala", city: "Bengaluru" },
  { id: "bandra",      name: "Bandra",      city: "Mumbai"    },
  { id: "cp",          name: "Connaught Place", city: "Delhi" },
];

export const TRIGGERS = [
  { id: "rain",   emoji: "⛈️",  label: "Heavy Rainfall",    detail: "22 mm/hr sustained",      color: "#38bdf8", payoutMult: 1.0 },
  { id: "aqi",    emoji: "😷",  label: "Severe AQI",        detail: "AQI 340 — Hazardous",      color: "#a78bfa", payoutMult: 0.6 },
  { id: "strike", emoji: "🚫",  label: "Civil Disruption",  detail: "Orders dropped 73%",       color: "#f43f5e", payoutMult: 1.0 },
];

export const FRAUD_CHECKS = [
  { icon: "📡", label: "GPS + Cell Tower Fusion",   detail: "Cross-references GPS coordinates with Cell Tower IDs & WiFi SSIDs to detect location mismatch." },
  { icon: "📳", label: "Accelerometer Analysis",    detail: "A bike in a storm has a specific vibration signature. A spoofed phone on a desk is perfectly still." },
  { icon: "🔒", label: "Device Integrity Check",    detail: "Detects if Developer Options or Mock Location permissions are enabled. Triggers instant deactivation." },
  { icon: "🕵️", label: "Cluster Anomaly Detection", detail: "Isolation Forest flags fraud rings — 50 riders stationary at the same GPS coordinate = flagged." },
  { icon: "🌐", label: "Network Fingerprinting",    detail: "Multiple accounts from the same IP or MAC address detected as a fraud farm." },
];
