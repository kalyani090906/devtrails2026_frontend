export const TIERS = [
  { id: "basic",    name: "Basic",    premium: 29, maxPayout: 300,  dailyPayout: 100, color: "#64748b", tw: "text-slate-400",  border: "border-slate-600/40",  bg: "bg-slate-500/10" },
  { id: "standard", name: "Standard", premium: 49, maxPayout: 600,  dailyPayout: 280, color: "#f59e0b", tw: "text-amber-400",  border: "border-amber-500/40",  bg: "bg-amber-500/10" },
  { id: "plus",     name: "Plus",     premium: 79, maxPayout: 1000, dailyPayout: 400, color: "#38bdf8", tw: "text-sky-400",    border: "border-sky-500/40",    bg: "bg-sky-500/10"  },
];

export const ZONES = [
  { id: "koramangala", name: "Koramangala", city: "Bengaluru",
    riskScore: 78, rainDays: 4.2, aqiAvg: 88,  triggerFreq: 4.2, basePremiumMult: 1.12 },
  { id: "bandra",      name: "Bandra",      city: "Mumbai",
    riskScore: 65, rainDays: 3.1, aqiAvg: 112, triggerFreq: 3.1, basePremiumMult: 0.98 },
  { id: "cp",          name: "Connaught Place", city: "Delhi",
    riskScore: 85, rainDays: 2.0, aqiAvg: 228, triggerFreq: 5.5, basePremiumMult: 1.28 },
  { id: "whitefield",  name: "Whitefield",  city: "Bengaluru",
    riskScore: 55, rainDays: 3.0, aqiAvg: 72,  triggerFreq: 2.8, basePremiumMult: 0.88 },
  { id: "andheri",     name: "Andheri",     city: "Mumbai",
    riskScore: 70, rainDays: 3.6, aqiAvg: 135, triggerFreq: 3.8, basePremiumMult: 1.05 },
];

export const TRIGGERS = [
  { id: "rain",   emoji: "⛈️",  label: "Heavy Rainfall",    detail: "22 mm/hr sustained",       color: "#38bdf8", payoutMult: 1.0,  threshold: ">15mm/hr",  source: "OpenWeatherMap" },
  { id: "aqi",    emoji: "😷",  label: "Severe AQI",        detail: "AQI 340 — Hazardous",       color: "#a78bfa", payoutMult: 0.6,  threshold: "AQI >300",  source: "AQICN API"      },
  { id: "strike", emoji: "🚫",  label: "Civil Disruption",  detail: "Orders dropped 73%",        color: "#f43f5e", payoutMult: 1.0,  threshold: "Orders <30%",source: "GDELT + Swiggy" },
  { id: "heat",   emoji: "🌡️",  label: "Extreme Heat",      detail: "Temperature 46°C",          color: "#fb923c", payoutMult: 0.8,  threshold: "Temp >44°C",source: "OpenWeatherMap" },
  { id: "flood",  emoji: "🌊",  label: "Flash Flood Alert", detail: "IMD Red Alert issued",      color: "#06b6d4", payoutMult: 1.0,  threshold: "IMD Red",   source: "IMD / NDMA API" },
];

export const FRAUD_CHECKS = [
  { icon: "📡", label: "GPS + Cell Tower Fusion",   detail: "Cross-references GPS coordinates with Cell Tower IDs & WiFi SSIDs to detect location mismatch." },
  { icon: "📳", label: "Accelerometer Analysis",    detail: "A bike in a storm has a specific vibration signature. A spoofed phone on a desk is perfectly still." },
  { icon: "🔒", label: "Device Integrity Check",    detail: "Detects if Developer Options or Mock Location permissions are enabled. Triggers instant deactivation." },
  { icon: "🕵️", label: "Cluster Anomaly Detection", detail: "Isolation Forest flags fraud rings — 50 riders stationary at the same GPS coordinate = flagged." },
  { icon: "🌐", label: "Network Fingerprinting",    detail: "Multiple accounts from the same IP or MAC address detected as a fraud farm." },
];

// Actuarial constants for admin dashboard
export const ACTUARIAL = {
  targetLossRatio:   0.65,
  poolRiders:        340,
  avgWeeklyPremium:  52,
  expectedClaimsPerRiderPerWeek: 0.18,
  adminCostPct:      0.05,
};
