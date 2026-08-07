import { motion } from "motion/react";
import { BatteryCharging, Banknote, Coffee, Sofa, Toilet, UtensilsCrossed } from "lucide-react";
import { useUser } from "@/context/UserContext";

const AMENITIES = [
  { icon: Coffee, label: "Coffee", query: "Find the nearest coffee shop" },
  { icon: UtensilsCrossed, label: "Food", query: "Where can I find food nearby?" },
  { icon: Toilet, label: "Restrooms", query: "Find the nearest restroom" },
  { icon: Banknote, label: "ATM", query: "Where is the closest ATM?" },
  { icon: Sofa, label: "Lounges", query: "Which lounge can I access?" },
  { icon: BatteryCharging, label: "Charging", query: "Find a charging station" },
];

/** Quick amenity shortcuts — each one fires an /api/ask request. */
export function AmenitySearch() {
  const { ask, isThinking } = useUser();

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {AMENITIES.map(({ icon: Icon, label, query }, i) => (
        <motion.button
          key={label}
          type="button"
          disabled={isThinking}
          onClick={() => void ask(query)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
          {label}
        </motion.button>
      ))}
    </div>
  );
}
