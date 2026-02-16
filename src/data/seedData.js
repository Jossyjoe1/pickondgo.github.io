import { cryptoRandomId } from "@/utils/cryptoRandomId";

export function seedRides() {
  const seedId = cryptoRandomId();
  return [
    {
      id: seedId,
      publicId: "PTG-482019",
      vehicleType: "car",
      pickup: "Lekki Phase 1 Gate",
      dropoff: "Victoria Island",
      note: "",
      estimatedFare: 4500,
      distanceKm: 12.4,
      durationMin: 28,
      paymentMethod: "cash",
      paymentStatus: "n/a",
      txRef: null,
      status: "requested",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      assignment: null,
      cashConfirmed: false,
      negotiation: null,
      seatRequest: null,
    },
  ];
}

export function seedShuttles() {
  return [
    {
      id: "s1",
      driverId: "d3",
      driverName: "Sani M.",
      vehicle: "Hiace Shuttle • White",
      plate: "LAG 221 RT",
      capacity: 18,
      filled: 6,
      status: "active",
      finalDestination: "Victoria Island",
      junctions: ["Ajah", "VGC", "Chevron", "Lekki Phase 1", "Ikoyi Bridge", "Victoria Island"],
      junctionIndex: 2,
      currentJunction: "Chevron",
      acceptedRideIds: [],
    },
  ];
}

