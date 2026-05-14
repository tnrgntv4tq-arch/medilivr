export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

const BASE_PRICE = 2.0;
const PRICE_PER_KM = 0.5;
const MIN_PRICE = 3.0;

export function calculatePrice(distanceKm: number): { distance: number; basePrice: number; pricePerKm: number; totalPrice: number } {
  const total = Math.max(MIN_PRICE, BASE_PRICE + distanceKm * PRICE_PER_KM);
  return {
    distance: Math.round(distanceKm * 100) / 100,
    basePrice: BASE_PRICE,
    pricePerKm: PRICE_PER_KM,
    totalPrice: Math.round(total * 100) / 100,
  };
}
