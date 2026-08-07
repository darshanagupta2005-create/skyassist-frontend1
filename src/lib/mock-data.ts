import type { AskResponse, FlightInfo, LoginPayload, MapMarker, UserProfile } from "./types";

export const AMENITY_MARKERS: MapMarker[] = [
  { id: "m1", kind: "you", label: "You are here", x: 22, y: 68, detail: "Terminal 3 · Concourse A" },
  { id: "m2", kind: "coffee", label: "Starbucks", x: 40, y: 46, detail: "Open · 120 m away" },
  { id: "m3", kind: "coffee", label: "Costa Coffee", x: 63, y: 74, detail: "Open · 240 m away" },
  { id: "m4", kind: "food", label: "Sky Food Court", x: 55, y: 24, detail: "18 outlets · Level 2" },
  { id: "m5", kind: "restroom", label: "Restrooms A4", x: 33, y: 82, detail: "Accessible" },
  { id: "m6", kind: "atm", label: "HSBC ATM", x: 74, y: 40, detail: "Multi-currency" },
  { id: "m7", kind: "medical", label: "Medical Centre", x: 12, y: 34, detail: "24/7 · Level 1" },
  { id: "m8", kind: "charging", label: "Charging Pods", x: 47, y: 62, detail: "USB-C · Wireless" },
  { id: "m9", kind: "lounge", label: "Aurora Lounge", x: 82, y: 20, detail: "Priority Pass" },
  { id: "m10", kind: "gate", label: "Gate A12", x: 88, y: 58, detail: "Boarding 19:35" },
];

export const DEFAULT_ROUTE = [
  { x: 22, y: 68 },
  { x: 31, y: 60 },
  { x: 40, y: 46 },
];

export function mockProfile(payload: LoginPayload): UserProfile {
  return {
    id: "PAX-88214",
    name: payload.passengerName || "Aarav Sharma",
    email: payload.email,
    flightNumber: (payload.flightNumber || "SQ 423").toUpperCase(),
    accessibility: payload.accessibility,
    language: payload.language,
    frequentFlyerTier: "KrisFlyer Gold",
  };
}

export function mockFlight(flightNumber: string): FlightInfo {
  const now = Date.now();
  return {
    flightNumber: flightNumber || "SQ 423",
    airline: "Singapore Airlines",
    from: "SIN · Changi T3",
    to: "DXB · Dubai Intl",
    terminal: "3",
    gate: "A12",
    boardingTime: new Date(now + 42 * 60_000).toISOString(),
    departureTime: new Date(now + 77 * 60_000).toISOString(),
    status: "On Time",
    delayMinutes: 0,
  };
}

const pick = (q: string, keys: string[]) => keys.some((k) => q.toLowerCase().includes(k));

export function mockAsk(question: string): AskResponse {
  if (pick(question, ["restroom", "toilet", "washroom"])) {
    return {
      response:
        "The nearest accessible restroom is Restrooms A4, just past the duty-free walkway on your right. It has baby-change facilities and a wheelchair-accessible cubicle.",
      steps: [
        "Head south along Concourse A for 60 metres",
        "Pass the duty-free walkway on your right",
        "Restrooms A4 are immediately after the water refill station",
      ],
      markers: AMENITY_MARKERS.filter((m) => ["you", "restroom"].includes(m.kind)),
      route: [
        { x: 22, y: 68 },
        { x: 27, y: 76 },
        { x: 33, y: 82 },
      ],
      estimatedTime: "2 min",
      distance: "90 m",
    };
  }
  if (pick(question, ["gate", "boarding"])) {
    return {
      response:
        "Gate A12 is at the far end of Concourse A. Boarding opens at 19:35 and the gate closes 15 minutes before departure. You have plenty of time — the walk takes about 8 minutes.",
      steps: [
        "Walk east along Concourse A past the Sky Food Court",
        "Take the moving walkway for 300 metres",
        "Keep right at the A10–A14 junction",
        "Gate A12 will be on your left",
      ],
      markers: AMENITY_MARKERS.filter((m) => ["you", "gate", "food"].includes(m.kind)),
      route: [
        { x: 22, y: 68 },
        { x: 45, y: 60 },
        { x: 70, y: 62 },
        { x: 88, y: 58 },
      ],
      estimatedTime: "8 min",
      distance: "620 m",
    };
  }
  if (pick(question, ["security", "immigration"])) {
    return {
      response:
        "Security screening at Concourse A is currently running at a 9-minute average wait. Passengers with priority boarding can use Lane 3, which is under 4 minutes.",
      steps: [
        "Follow the overhead signs for Central Security",
        "Have your boarding pass QR ready at the e-gates",
        "Use Lane 3 for priority screening",
      ],
      markers: AMENITY_MARKERS.filter((m) => m.kind === "you"),
      route: DEFAULT_ROUTE,
      estimatedTime: "9 min wait",
      distance: "150 m",
    };
  }
  if (pick(question, ["wheelchair", "assistance", "help", "staff"])) {
    return {
      response:
        "Wheelchair assistance is available on request. I have flagged the nearest special-assistance desk — a staff member can meet you at your current location within 6 minutes.",
      steps: [
        "Stay near the Charging Pods seating area",
        "A special-assistance agent will arrive with a wheelchair",
        "They will escort you through priority security to your gate",
      ],
      markers: AMENITY_MARKERS.filter((m) => ["you", "medical"].includes(m.kind)),
      route: [
        { x: 22, y: 68 },
        { x: 17, y: 50 },
        { x: 12, y: 34 },
      ],
      estimatedTime: "6 min",
      distance: "On request",
    };
  }
  if (pick(question, ["atm", "cash", "money", "currency"])) {
    return {
      response:
        "The closest ATM is the HSBC multi-currency machine near the Aurora Lounge entrance. It dispenses SGD, USD and AED with no terminal surcharge.",
      steps: [
        "Head east towards the Sky Food Court",
        "Turn left at the escalator bank",
        "The ATM is beside the Aurora Lounge entrance",
      ],
      markers: AMENITY_MARKERS.filter((m) => ["you", "atm"].includes(m.kind)),
      route: [
        { x: 22, y: 68 },
        { x: 50, y: 55 },
        { x: 74, y: 40 },
      ],
      estimatedTime: "5 min",
      distance: "380 m",
    };
  }
  if (pick(question, ["charge", "charging", "power", "battery"])) {
    return {
      response:
        "Charging Pods are 70 metres ahead in the central seating zone. Each pod has USB-C, wireless charging and a universal socket.",
      steps: [
        "Walk straight past the information desk",
        "The charging pods are in the central seating zone",
      ],
      markers: AMENITY_MARKERS.filter((m) => ["you", "charging"].includes(m.kind)),
      route: [
        { x: 22, y: 68 },
        { x: 35, y: 65 },
        { x: 47, y: 62 },
      ],
      estimatedTime: "1 min",
      distance: "70 m",
    };
  }
  if (pick(question, ["lounge"])) {
    return {
      response:
        "The Aurora Lounge on Level 3 accepts your KrisFlyer Gold membership. It is quiet right now with hot breakfast served until 11:00.",
      steps: [
        "Take the escalator beside the Sky Food Court to Level 3",
        "Turn right after the art installation",
        "Scan your boarding pass at the lounge reception",
      ],
      markers: AMENITY_MARKERS.filter((m) => ["you", "lounge"].includes(m.kind)),
      route: [
        { x: 22, y: 68 },
        { x: 55, y: 40 },
        { x: 82, y: 20 },
      ],
      estimatedTime: "7 min",
      distance: "540 m",
    };
  }
  if (pick(question, ["food", "eat", "restaurant", "burger", "meal"])) {
    return {
      response:
        "Sky Food Court on Level 2 has 18 outlets including Hainanese chicken rice, ramen and vegetarian options. Average wait is 6 minutes.",
      steps: [
        "Continue north for 90 metres",
        "Take the escalator to Level 2",
        "Sky Food Court is directly ahead",
      ],
      markers: AMENITY_MARKERS.filter((m) => ["you", "food"].includes(m.kind)),
      route: [
        { x: 22, y: 68 },
        { x: 38, y: 44 },
        { x: 55, y: 24 },
      ],
      estimatedTime: "6 min",
      distance: "420 m",
    };
  }
  // Default: coffee
  return {
    response:
      "The nearest coffee shop is Starbucks in Concourse A. Walk straight for 120 metres, then turn left at the information desk. Estimated walking time is 3 minutes.",
    steps: [
      "Walk straight for 120 metres",
      "Turn left at the information desk",
      "Starbucks is on your right, opposite Gate A6",
    ],
    markers: AMENITY_MARKERS.filter((m) => ["you", "coffee"].includes(m.kind)),
    route: DEFAULT_ROUTE,
    estimatedTime: "3 min",
    distance: "120 m",
  };
}
