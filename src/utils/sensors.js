export function getRainfall(zoneId, activeTrigger) {
  const base = { koramangala: 4, bandra: 2, cp: 1, whitefield: 3, andheri: 2.5 };
  if (activeTrigger === "rain") return 22 + Math.random() * 6;
  return (base[zoneId] || 3) + Math.random() * 3;
}

export function getAQI(zoneId, activeTrigger) {
  const base = { koramangala: 88, bandra: 115, cp: 225, whitefield: 72, andheri: 138 };
  if (activeTrigger === "aqi") return 340 + Math.random() * 55;
  return (base[zoneId] || 100) + Math.random() * 18;
}

export function getOrderVolume(activeTrigger) {
  if (activeTrigger === "strike" || activeTrigger === "flood") return 12 + Math.floor(Math.random() * 18);
  return 74 + Math.floor(Math.random() * 22);
}

export function getTemp(zoneId, activeTrigger) {
  const base = { koramangala: 29, bandra: 33, cp: 39, whitefield: 28, andheri: 34 };
  if (activeTrigger === "heat") return 45 + Math.random() * 3;
  return (base[zoneId] || 32) + Math.random() * 3;
}

// AI dynamic premium: regression-style calculation
export function calcDynamicPremium(basePremium, zone, platformActive) {
  if (!zone) return basePremium;
  const mult   = zone.basePremiumMult ?? 1;
  const risk   = (zone.riskScore ?? 65) / 100;
  const freq   = (zone.triggerFreq ?? 3) / 5;
  const score  = (mult * 0.4 + risk * 0.35 + freq * 0.25);
  const adjusted = Math.round(basePremium * score * (platformActive ? 0.95 : 1));
  return Math.max(basePremium - 8, Math.min(basePremium + 22, adjusted));
}
