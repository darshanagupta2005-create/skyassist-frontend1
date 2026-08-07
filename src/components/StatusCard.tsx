import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Clock, DoorOpen, LandPlot, Luggage, Plane, Timer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FlightInfo } from "@/lib/types";

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function useCountdown(target?: string) {
  const [left, setLeft] = useState("--:--");
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setLeft("Boarding now");
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setLeft(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

/** Small labelled metric used inside the flight card. */
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-primary-foreground/10 p-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-primary-foreground/70">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-primary-foreground">{value}</p>
    </div>
  );
}

export function StatusCard({ flight }: { flight: FlightInfo | null }) {
  const countdown = useCountdown(flight?.boardingTime);

  if (!flight) {
    return (
      <div className="rounded-3xl p-6 card-elevated">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-3 h-16 w-full" />
      </div>
    );
  }

  const onTime = flight.status === "On Time";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl gradient-night p-6 shadow-[var(--shadow-float)]"
      aria-label="Flight information"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Airline logo placeholder */}
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-foreground/15 text-primary-foreground">
            <Plane className="size-5" />
          </span>
          <div>
            <p className="text-xl font-semibold tracking-tight text-primary-foreground">
              {flight.flightNumber}
            </p>
            <p className="text-xs text-primary-foreground/70">{flight.airline}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            onTime ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
          }`}
        >
          {onTime ? "On Time" : `Delayed ${flight.delayMinutes}m`}
        </span>
      </div>

      <div className="relative mt-6 flex items-center gap-4">
        <div>
          <p className="text-2xl font-semibold text-primary-foreground">{flight.from.split(" ")[0]}</p>
          <p className="text-[11px] text-primary-foreground/60">{flight.from}</p>
        </div>
        <div className="relative flex-1">
          <div className="h-px w-full bg-primary-foreground/25" />
          <motion.span
            className="absolute -top-2 text-primary-foreground"
            initial={{ left: "0%" }}
            animate={{ left: "88%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          >
            <Plane className="size-4 rotate-90" />
          </motion.span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-primary-foreground">{flight.to.split(" ")[0]}</p>
          <p className="text-[11px] text-primary-foreground/60">{flight.to}</p>
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={DoorOpen} label="Gate" value={flight.gate} />
        <Metric icon={LandPlot} label="Terminal" value={flight.terminal} />
        <Metric icon={Luggage} label="Boarding" value={fmt(flight.boardingTime)} />
        <Metric icon={Clock} label="Departs" value={fmt(flight.departureTime)} />
      </div>

      <div className="relative mt-3 flex items-center justify-between rounded-2xl bg-primary-foreground/10 px-4 py-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary-foreground/70">
          <Timer className="size-3.5" /> Boarding starts in
        </p>
        <p className="font-mono text-lg font-semibold text-primary-foreground">{countdown}</p>
      </div>
    </motion.section>
  );
}
