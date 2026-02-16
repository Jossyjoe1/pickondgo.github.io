export function estimateFare({ vehicleType, distanceKm, durationMin, pricing }) {
  const p = pricing[vehicleType];
  const raw = p.base + p.perKm * distanceKm + p.perMin * durationMin;
  return Math.max(p.min, Math.round(raw / 50) * 50);
}
