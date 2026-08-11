import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import type {
  AppNotification,
  BoardingPass,
  AskResponse,
  ChatMessage,
  FlightInfo,
  LoginPayload,
  MapMarker,
  UserProfile,
} from "@/lib/types";
import { AMENITY_MARKERS, DEFAULT_ROUTE } from "@/lib/mock-data";
import { createTranslator, type Translator } from "@/lib/i18n";
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
  t: Translator;
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
  applyBoardingPass: (pass: BoardingPass) => void;
  loadingAuth: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = "aero.profile";
const LANG_KEY = "aero.language";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [flight, setFlight] = useState<FlightInfo | null>(null);
  const [language, setLanguageState] = useState("English");
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

  const setLanguage = useCallback((next: string) => {
    setLanguageState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, next);
  }, []);

  const t = useMemo(() => createTranslator(language), [language]);

  // Restore the language preference so switching survives a refresh.
  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored) setLanguageState(stored);
  }, []);

  // Restore the session so a refresh keeps the passenger signed in.
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const profile = JSON.parse(raw) as UserProfile;
      setUser(profile);
      if (!window.localStorage.getItem(LANG_KEY)) setLanguageState(profile.language);
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

  /** Merge scanned boarding-pass data into the existing flight state. */
  const applyBoardingPass = useCallback((pass: BoardingPass) => {
    setFlight((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        flightNumber: pass.flightNumber ?? prev.flightNumber,
        gate: pass.gate ?? prev.gate,
        terminal: pass.terminal ?? prev.terminal,
        to: pass.destination ?? prev.to,
        from: pass.origin ?? prev.from,
        departureTime: pass.departureTime ?? prev.departureTime,
        boardingTime: pass.boardingTime ?? prev.boardingTime,
      };
    });
    if (pass.passengerName) {
      setUser((prev) => (prev ? { ...prev, name: pass.passengerName as string } : prev));
    }
    toast.success(createTranslator(language)("scanned_title"), {
      description: createTranslator(language)("flight_updated"),
    });
  }, [language]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      flight,
      language,
      setLanguage,
      t,
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
      applyBoardingPass,
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
      applyBoardingPass,
      setLanguage,
      t,
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
