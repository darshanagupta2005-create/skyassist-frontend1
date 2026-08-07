import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import type {
  AppNotification,
  AskResponse,
  ChatMessage,
  FlightInfo,
  LoginPayload,
  MapMarker,
  UserProfile,
} from "@/lib/types";
import { AMENITY_MARKERS, DEFAULT_ROUTE } from "@/lib/mock-data";
import { assistantApi, authApi, flightApi, panicApi } from "@/services/api";

export const JOURNEY_STEPS = [
  "Check-In",
  "Security",
  "Immigration",
  "Gate",
  "Boarding",
] as const;

interface UserContextValue {
  user: UserProfile | null;
  flight: FlightInfo | null;
  language: string;
  setLanguage: (code: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  messages: ChatMessage[];
  isThinking: boolean;
  markers: MapMarker[];
  route: { x: number; y: number }[];
  activeRouteLabel: string | null;
  journeyIndex: number;
  advanceJourney: () => void;
  notifications: AppNotification[];
  clearNotifications: () => void;
  emergencyOpen: boolean;
  setEmergencyOpen: (open: boolean) => void;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  ask: (question: string) => Promise<void>;
  reportEmergency: (type: string) => Promise<void>;
  loadingAuth: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = "aero.profile";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [flight, setFlight] = useState<FlightInfo | null>(null);
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>(AMENITY_MARKERS);
  const [route, setRoute] = useState(DEFAULT_ROUTE);
  const [activeRouteLabel, setActiveRouteLabel] = useState<string | null>(null);
  const [journeyIndex, setJourneyIndex] = useState(2);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "n1",
      title: "Gate assigned",
      body: "Your flight departs from Gate A12, Terminal 3.",
      time: "just now",
    },
    {
      id: "n2",
      title: "Security wait time",
      body: "Central security is averaging 9 minutes.",
      time: "6 min ago",
    },
  ]);

  // Restore the session so a refresh keeps the passenger signed in.
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const profile = JSON.parse(raw) as UserProfile;
      setUser(profile);
      setLanguage(profile.language);
      void flightApi.get(profile.flightNumber).then(setFlight);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoadingAuth(true);
    try {
      const profile = await authApi.login(payload);
      setUser(profile);
      setLanguage(profile.language);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      const info = await flightApi.get(profile.flightNumber);
      setFlight(info);
      toast.success(`Welcome aboard, ${profile.name.split(" ")[0]}`, {
        description: `${info.flightNumber} · Gate ${info.gate} · Terminal ${info.terminal}`,
      });
    } catch {
      toast.error("We couldn't sign you in. Please try again.");
      throw new Error("login failed");
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setFlight(null);
    setMessages([]);
  }, []);

  const applyAnswer = useCallback((data: AskResponse, question: string) => {
    setMarkers(data.markers.length ? data.markers : AMENITY_MARKERS);
    setRoute(data.route);
    setActiveRouteLabel(question);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", text: trimmed, createdAt: Date.now() },
      ]);
      setIsThinking(true);
      try {
        const data = await assistantApi.ask(trimmed, language);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: data.response,
            steps: data.steps,
            estimatedTime: data.estimatedTime,
            distance: data.distance,
            createdAt: Date.now(),
          },
        ]);
        applyAnswer(data, trimmed);
      } catch {
        toast.error("The assistant is unavailable right now.");
      } finally {
        setIsThinking(false);
      }
    },
    [applyAnswer, language],
  );

  const reportEmergency = useCallback(
    async (type: string) => {
      const { ticketId } = await panicApi.report({
        type,
        flightNumber: user?.flightNumber ?? "",
        passengerName: user?.name ?? "",
      });
      setNotifications((prev) => [
        {
          id: crypto.randomUUID(),
          title: `${type} reported`,
          body: `Ticket ${ticketId} — an airport agent is on the way.`,
          time: "just now",
        },
        ...prev,
      ]);
      toast.success(`${type} reported`, {
        description: `Ticket ${ticketId}. Airport staff have been alerted.`,
      });
      setEmergencyOpen(false);
    },
    [user],
  );

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      flight,
      language,
      setLanguage,
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      messages,
      isThinking,
      markers,
      route,
      activeRouteLabel,
      journeyIndex,
      advanceJourney: () =>
        setJourneyIndex((i) => Math.min(i + 1, JOURNEY_STEPS.length - 1)),
      notifications,
      clearNotifications: () => setNotifications([]),
      emergencyOpen,
      setEmergencyOpen,
      login,
      logout,
      ask,
      reportEmergency,
      loadingAuth,
    }),
    [
      user,
      flight,
      language,
      theme,
      messages,
      isThinking,
      markers,
      route,
      activeRouteLabel,
      journeyIndex,
      notifications,
      emergencyOpen,
      login,
      logout,
      ask,
      reportEmergency,
      loadingAuth,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
