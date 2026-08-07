import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Loader2, Lock, Mail, Plane, Ticket, UserRound } from "lucide-react";
import heroImage from "@/assets/airport-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useUser } from "@/context/UserContext";
import type { Accessibility } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AeroGuide · AI Airport Navigation & Passenger Assistance" },
      {
        name: "description",
        content:
          "Sign in to AeroGuide for AI-powered airport navigation, live flight status, terminal maps and instant passenger assistance.",
      },
      { property: "og:title", content: "AeroGuide · AI Airport Assistant" },
      {
        property: "og:description",
        content:
          "AI-powered wayfinding, live gate updates and 24/7 passenger assistance across the terminal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, loadingAuth, language, setLanguage } = useUser();
  const [form, setForm] = useState({
    email: "aarav.sharma@travel.com",
    password: "passenger",
    passengerName: "Aarav Sharma",
    flightNumber: "SQ 423",
    accessibility: "standard" as Accessibility,
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ ...form, language });
      await navigate({ to: "/dashboard" });
    } catch {
      /* toast already surfaced in context */
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={heroImage}
        alt="Modern international airport terminal at blue hour"
        width={1600}
        height={1200}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-[oklch(0.16_0.05_265_/_0.72)]" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden text-primary-foreground lg:block"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium backdrop-blur">
            <Plane className="size-3.5" /> Changi Terminal 3 · AI Passenger Assist
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight">
            Never lose your way
            <br />
            inside the terminal.
          </h1>
          <p className="mt-5 max-w-md text-sm text-primary-foreground/75">
            AeroGuide combines live flight data, indoor wayfinding and a multilingual AI assistant
            so every passenger — including elderly and wheelchair travellers — reaches the gate calm
            and on time.
          </p>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              ["68 M", "passengers guided"],
              ["9 s", "avg. answer time"],
              ["24 / 7", "assistance desk"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
                <dt className="text-2xl font-semibold">{value}</dt>
                <dd className="mt-1 text-[11px] text-primary-foreground/70">{label}</dd>
              </div>
            ))}
          </dl>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="rounded-3xl p-7 glass-panel">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl gradient-sky text-primary-foreground">
                <Plane className="size-5" />
              </span>
              <div>
                <p className="text-lg font-semibold tracking-tight">AeroGuide</p>
                <p className="text-xs text-muted-foreground">Welcome back — let's get you to your gate.</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="h-12 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="h-12 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Passenger name</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      required
                      value={form.passengerName}
                      onChange={(e) => update("passengerName", e.target.value)}
                      className="h-12 rounded-xl pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="flight">Flight number</Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="flight"
                      required
                      value={form.flightNumber}
                      onChange={(e) => update("flightNumber", e.target.value)}
                      className="h-12 rounded-xl pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Accessibility</Label>
                  <Select
                    value={form.accessibility}
                    onValueChange={(v) => update("accessibility", v)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="elderly">Elderly</SelectItem>
                      <SelectItem value="wheelchair">Wheelchair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Preferred language</Label>
                  <LanguageSelector value={language} onChange={setLanguage} />
                </div>
              </div>

              <Button type="submit" disabled={loadingAuth} className="h-13 w-full rounded-xl text-base">
                {loadingAuth ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Checking you in…
                  </>
                ) : (
                  "Sign in to AeroGuide"
                )}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Secure airport session · Your data stays inside the terminal network.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
