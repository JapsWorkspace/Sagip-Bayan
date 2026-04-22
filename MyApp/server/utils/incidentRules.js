const incidentRules = {
  fire: ["fire", "flame", "smoke", "burning"],

  flood: ["water", "flood", "river", "rain", "storm", "overflow"],

  accident: ["car", "vehicle", "crash", "accident", "road", "truck"]
};
const JAEN_CENTER = {
  lat: 15.3382,
  lng: 120.9056,
};

const MAX_DISTANCE_KM = 10; // adjust if needed

const isWithinJaen = (gps) => {
  if (!gps) return false;

  const toRad = (v) => (v * Math.PI) / 180;

  const R = 6371; // Earth radius in KM
  const dLat = toRad(gps.lat - JAEN_CENTER.lat);
  const dLng = toRad(gps.lng - JAEN_CENTER.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(JAEN_CENTER.lat)) *
      Math.cos(toRad(gps.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= MAX_DISTANCE_KM;
};

module.exports = incidentRules;