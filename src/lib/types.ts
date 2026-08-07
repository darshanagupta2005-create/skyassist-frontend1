export type Accessibility = "standard" | "elderly" | "wheelchair";

export interface LoginPayload {
  email: string;
  password: string;
  passengerName: string;
  flightNumber: string;
  accessibility: Accessibility;
  language: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  flightNumber: string;
  accessibility: Accessibility;
  language: string;
  frequentFlyerTier: string;
}

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  terminal: string;
  gate: string;
  departureTime: string; // ISO
  boardingTime: string; // ISO
  status: "On Time" | "Delayed" | "Boarding" | "Final Call";
  delayMinutes: number;
}

export type MarkerKind =
  | "coffee"
  | "food"
  | "restroom"
  | "atm"
  | "medical"
  | "charging"
  | "lounge"
  | "gate"
  | "you";

export interface MapMarker {
  id: string;
  kind: MarkerKind;
  label: string;
  x: number; // percentage position on the terminal plan
  y: number;
  detail?: string;
}

export interface AskResponse {
  response: string;
  steps: string[];
  markers: MapMarker[];
  route: { x: number; y: number }[];
  estimatedTime: string;
  distance: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  steps?: string[];
  estimatedTime?: string;
  distance?: string;
  createdAt: number;
}

export interface PanicPayload {
  type: string;
  flightNumber: string;
  passengerName: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
}
