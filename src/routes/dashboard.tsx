import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AIChat } from "@/components/AIChat";
import { AmenitySearch } from "@/components/AmenitySearch";
import { MapView } from "@/components/MapView";
import { Navbar } from "@/components/Navbar";
import { PanicModal } from "@/components/PanicModal";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { StatusCard } from "@/components/StatusCard";
import { useUser } from "@/context/UserContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · AeroGuide Airport Assistant" },
      {
        name: "description",
        content:
          "Live flight status, journey timeline, terminal map and the AI airport assistant in one passenger dashboard.",
      },
      { property: "og:title", content: "AeroGuide Passenger Dashboard" },
      {
        property: "og:description",
        content: "Track your gate, boarding countdown and navigate the terminal with AI guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, flight } = useUser();
  const navigate = useNavigate();

  // Guard: send unauthenticated passengers back to the login screen.
  useEffect(() => {
    const hasSession = window.localStorage.getItem("aero.profile");
    if (!user && !hasSession) void navigate({ to: "/" });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:py-8"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Good day{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            {flight
              ? `${flight.flightNumber} to ${flight.to} · Gate ${flight.gate} · Terminal ${flight.terminal}`
              : "Loading your flight…"}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <StatusCard flight={flight} />
            <AmenitySearch />
            <AIChat />
            <MapView />
          </div>
          <div className="space-y-5">
            <ProgressTimeline />
            <section className="rounded-3xl p-6 card-elevated">
              <h2 className="text-sm font-semibold tracking-tight">Terminal conditions</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  ["Central security", "9 min wait", "text-warning"],
                  ["Immigration e-gates", "4 min wait", "text-success"],
                  ["Concourse A walkway", "Operational", "text-success"],
                  ["Baggage belt 7", "Delayed 12 min", "text-destructive"],
                ].map(([label, value, tone]) => (
                  <li key={label} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-medium ${tone}`}>{value}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </motion.main>

      <PanicModal />
    </div>
  );
}
