import { useState } from "react";
import { motion } from "motion/react";
import {
  Accessibility,
  BriefcaseMedical,
  Luggage,
  PhoneCall,
  PlaneTakeoff,
  ShieldAlert,
  UserRoundCog,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";

const OPTIONS = [
  { icon: PlaneTakeoff, label: "Missed Flight", hint: "Rebooking desk will be alerted" },
  { icon: Luggage, label: "Lost Baggage", hint: "Baggage services · Belt 7" },
  { icon: BriefcaseMedical, label: "Medical Emergency", hint: "Paramedics dispatched", urgent: true },
  { icon: UserRoundCog, label: "Need Airport Staff", hint: "Nearest agent notified" },
  { icon: Accessibility, label: "Request Wheelchair", hint: "Special assistance team" },
  { icon: PhoneCall, label: "Call Airport Help", hint: "+65 6595 6868 · 24/7" },
];

/** Floating SOS button plus the emergency options modal. */
export function PanicModal() {
  const { emergencyOpen, setEmergencyOpen, reportEmergency } = useUser();
  const [pending, setPending] = useState<string | null>(null);

  const handle = async (label: string) => {
    setPending(label);
    try {
      await reportEmergency(label);
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setEmergencyOpen(true)}
        aria-label="Emergency assistance"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 240, damping: 18 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-[var(--shadow-float)] pulse-ring"
      >
        <ShieldAlert className="size-6" />
      </motion.button>

      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5" /> Emergency assistance
            </DialogTitle>
            <DialogDescription>
              Choose what you need. Airport staff receive your gate, terminal and flight instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 sm:grid-cols-2">
            {OPTIONS.map(({ icon: Icon, label, hint, urgent }, i) => (
              <motion.button
                key={label}
                type="button"
                disabled={pending !== null}
                onClick={() => void handle(label)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                whileHover={{ y: -2 }}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors disabled:opacity-60 ${
                  urgent
                    ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
                    : "border-border hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                    urgent ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {pending === label ? "Alerting staff…" : hint}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
