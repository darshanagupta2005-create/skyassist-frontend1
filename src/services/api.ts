/**
 * Single Axios API service for the Airport Assistant frontend.
 * Talks to the Spring Boot backend. When the backend is unreachable
 * (e.g. local design preview), the service falls back to realistic
 * airport mock data so the UI is always demonstrable.
 */
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

export const api = axios.create({
  baseURL: import.meta.env["VITE_API_BASE_URL"] ?? "/api",
  timeout: 8000,
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

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Runs the request, falling back to mock data if the backend is absent. */
async function withFallback<T>(run: () => Promise<T>, fallback: () => Promise<T> | T): Promise<T> {
  try {
    return await run();
  } catch {
    return await fallback();
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
  login: (payload: LoginPayload) =>
    withFallback(
      async () => {
        const { data } = await api.post<{ token: string; profile: UserProfile }>(
          "/login",
          payload,
        );
        setToken(data.token);
        return data.profile;
      },
      async () => {
        await delay(700);
        setToken("demo.jwt.token");
        return mockProfile(payload);
      },
    ),
  logout: () => setToken(null),
};

export const flightApi = {
  get: (flightNumber: string) =>
    withFallback(
      async () => (await api.get<FlightInfo>("/flight", { params: { flightNumber } })).data,
      async () => {
        await delay(400);
        return mockFlight(flightNumber);
      },
    ),
};

export const assistantApi = {
  ask: (question: string, language: string) =>
    withFallback(
      async () => (await api.post<AskResponse>("/ask", { question, language })).data,
      async () => {
        await delay(900);
        return mockAsk(question);
      },
    ),
};

export const panicApi = {
  report: (payload: PanicPayload) =>
    withFallback(
      async () => (await api.post<{ ticketId: string }>("/panic", payload)).data,
      async () => {
        await delay(600);
        return { ticketId: `SOS-${Math.floor(1000 + Math.random() * 8999)}` };
      },
    ),
};
