import { motion } from "motion/react";
import {
  BatteryCharging,
  Banknote,
  Coffee,
  DoorOpen,
  HeartPulse,
  Locate,
  Sofa,
  Toilet,
  UtensilsCrossed,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { MarkerKind } from "@/lib/types";

const ICONS: Record<MarkerKind, typeof Coffee> = {
  coffee: Coffee,
  food: UtensilsCrossed,
  restroom: Toilet,
  atm: Banknote,
  medical: HeartPulse,
  charging: BatteryCharging,
  lounge: Sofa,
  gate: DoorOpen,
  you: Locate,
};

/**
 * Placeholder for the Google Maps component. It renders a stylised terminal
 * plan with animated markers and the walking route returned by /api/ask.
 * Swap the inner surface for <GoogleMap /> once the Maps key is wired up.
 */
export function MapView() {
  const { markers, route, activeRouteLabel } = useUser();
  const path = route.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <section className="overflow-hidden rounded-3xl card-elevated" aria-label="Airport map">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Terminal 3 · Concourse A</h2>
          <p className="text-xs text-muted-foreground">
            {activeRouteLabel ? `Route for “${activeRouteLabel}”` : "Live indoor positioning"}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          Google Maps
        </span>
      </header>

      <div className="relative h-[380px] w-full bg-[linear-gradient(0deg,transparent_23px,color-mix(in_oklab,var(--border)_60%,transparent)_24px),linear-gradient(90deg,transparent_23px,color-mix(in_oklab,var(--border)_60%,transparent)_24px)] bg-[length:24px_24px]">
        {/* Concourse silhouette */}
        <div className="pointer-events-none absolute inset-6 rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-primary/[0.04]" />

        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.polyline
            points={path}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </svg>

        {markers.map((m, i) => {
          const Icon = ICONS[m.kind];
          const isYou = m.kind === "you";
          return (
            <motion.div
              key={m.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 18 }}
            >
              <div className="group relative flex flex-col items-center">
                {isYou && (
                  <motion.span
                    className="absolute size-10 rounded-full bg-primary/25"
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <span
                  className={`relative grid size-8 place-items-center rounded-full shadow-[var(--shadow-card)] ${
                    isYou
                      ? "bg-primary text-primary-foreground"
                      : m.kind === "gate"
                        ? "bg-success text-success-foreground"
                        : "bg-card text-primary"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="pointer-events-none mt-1 whitespace-nowrap rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium opacity-0 shadow-[var(--shadow-card)] transition-opacity group-hover:opacity-100">
                  {m.label}
                  {m.detail ? ` · ${m.detail}` : ""}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
