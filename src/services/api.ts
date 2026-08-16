import axios from "axios";
import type {
  AskResponse,
  FlightInfo,
  LoginPayload,
  PanicPayload,
  UserProfile,
} from "@/lib/types";
import { mockAsk, mockFlight, mockProfile } from "@/lib/mock-data";

const TOKEN_KEY = "aero.jwt";

const RENDER_BACKEND_URL = "https://skyassist-backend-u2q1.onrender.com";
const BASE_URL =
  import.meta.env["VITE_API_URL"] ||
  import.meta.env["VITE_API_BASE_URL"] ||
  RENDER_BACKEND_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
  login: async (payload: LoginPayload): Promise<UserProfile> => {
    await delay(300);
    setToken("demo.jwt.token");
    return mockProfile(payload);
  },
  logout: () => setToken(null),
};

export const flightApi = {
  get: async (flightNumber: string): Promise<FlightInfo> => {
    try {
      const res = await api.get<FlightInfo>("/api/flight", { params: { flightNumber } });
      if (res.data && res.data.flightNumber) return res.data;
    } catch (e) {
      console.warn("Flight API fallback active:", e);
    }
    await delay(300);
    return mockFlight(flightNumber);
  },
};

export const assistantApi = {
  ask: async (question: string, language: string): Promise<AskResponse> => {
    try {
      const res = await api.post<AskResponse>("/api/ask", { question, language });
      if (res.data && res.data.response) return res.data;
    } catch (e) {
      console.warn("Assistant API fallback active:", e);
    }
    await delay(300);
    return mockAsk(question);
  },
};

export const panicApi = {
  report: async (payload: PanicPayload): Promise<{ ticketId: string }> => {
    await delay(400);
    return { ticketId: `SOS-${Math.floor(1000 + Math.random() * 8999)}` };
  },
};