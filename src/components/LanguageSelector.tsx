import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LANGUAGES = [
  "English",
  "हिन्दी (Hindi)",
  "मराठी (Marathi)",
  "Español",
  "العربية",
  "中文",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

/** Language picker used both on the login card and in the navbar. */
export function LanguageSelector({ value, onChange, compact }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={compact ? "h-9 w-[132px] rounded-full border-border/70" : "h-12 rounded-xl"}
        aria-label="Preferred language"
      >
        <Globe className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {lang}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
