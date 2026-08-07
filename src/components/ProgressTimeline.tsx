import { motion } from "motion/react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOURNEY_STEPS, useUser } from "@/context/UserContext";

const DETAIL: Record<string, string> = {
  "Check-In": "Row 12 · Completed 08:12",
  Security: "Lane 3 · Cleared 08:41",
  Immigration: "e-Gate 7 · ~9 min wait",
  Gate: "Gate A12 · 620 m away",
  Boarding: "Zone 2 · Opens 19:35",
};

export function ProgressTimeline() {
  const { journeyIndex, advanceJourney } = useUser();

  return (
    <section className="rounded-3xl p-6 card-elevated" aria-label="Journey progress">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Your journey</h2>
          <p className="text-xs text-muted-foreground">Terminal 3 · Concourse A</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={advanceJourney}
          disabled={journeyIndex >= JOURNEY_STEPS.length - 1}
          className="rounded-full text-xs"
        >
          Mark next <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <ol className="mt-5 space-y-1">
        {JOURNEY_STEPS.map((step, i) => {
          const done = i < journeyIndex;
          const current = i === journeyIndex;
          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.span
                  initial={false}
                  animate={{ scale: current ? [1, 1.12, 1] : 1 }}
                  transition={{ duration: 1.6, repeat: current ? Infinity : 0 }}
                  className={`grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition-colors ${
                    done
                      ? "border-transparent bg-success text-success-foreground"
                      : current
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </motion.span>
                {i < JOURNEY_STEPS.length - 1 && (
                  <span className="relative my-1 w-px flex-1 bg-border">
                    <motion.span
                      className="absolute inset-x-0 top-0 bg-success"
                      initial={{ height: 0 }}
                      animate={{ height: done ? "100%" : 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </span>
                )}
              </div>
              <div className="pb-5">
                <p
                  className={`text-sm font-medium ${
                    current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step}
                  {current && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{DETAIL[step]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
