export function getRainfall(zoneId, activeTrigger) {
  const base = { koramangala: 4, bandra: 2, cp: 1 };
  if (activeTrigger === "rain" && zoneId === "koramangala") return 22 + Math.random() * 6;
  return (base[zoneId] || 3) + Math.random() * 3;
}

export function getAQI(zoneId, activeTrigger) {
  const base = { koramangala: 88, bandra: 115, cp: 225 };
  if (activeTrigger === "aqi" && zoneId === "cp") return 340 + Math.random() * 55;
  return (base[zoneId] || 100) + Math.random() * 18;
}

export function getOrderVolume(activeTrigger) {
  if (activeTrigger === "strike") return 12 + Math.floor(Math.random() * 18);
  return 74 + Math.floor(Math.random() * 22);
}

export function getTemp(zoneId) {
  const base = { koramangala: 29, bandra: 33, cp: 39 };
  return (base[zoneId] || 32) + Math.random() * 3;
}
