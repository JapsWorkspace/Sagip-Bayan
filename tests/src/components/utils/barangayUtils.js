export function matchEvacToBarangay(evacCenters, barangays) {
  return evacCenters.map((evac) => {
    const match = barangays.features.find(
      (b) => b.properties.name === evac.barangay
    );

    return {
      ...evac,
      matchedBarangay: match?.properties?.name || null,
    };
  });
}