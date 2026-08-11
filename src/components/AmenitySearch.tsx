import { motion } from "motion/react";
import { BatteryCharging, Banknote, Coffee, Sofa, Toilet, UtensilsCrossed } from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { TranslationKey } from "@/lib/i18n";

const AMENITIES: { icon: typeof Coffee; key: TranslationKey; query: string }[] = [
  { icon: Coffee, key: "coffee", query: "Find the nearest coffee shop" },
  { icon: UtensilsCrossed, key: "food", query: "Where can I find food nearby?" },
  { icon: Toilet, key: "restrooms", query: "Find the nearest restroom" },
  { icon: Banknote, key: "atm", query: "Where is the closest ATM?" },
  { icon: Sofa, key: "lounges", query: "Which lounge can I access?" },
  { icon: BatteryCharging, key: "charging", query: "Find a charging station" },
];

/** Quick amenity shortcuts — each one fires an /api/ask request. */
export function AmenitySearch() {
  const { ask, isThinking, t } = useUser();

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {AMENITIES.map(({ icon: Icon, key, query }, i) => (
        <motion.button
          key={key}
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
          {t(key)}
        </motion.button>
      ))}
    </div>
  );
}
