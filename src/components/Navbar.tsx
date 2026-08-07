import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bell, LogOut, Moon, Plane, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useUser } from "@/context/UserContext";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Navbar() {
  const { user, language, setLanguage, theme, toggleTheme, notifications, clearNotifications, logout } =
    useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl gradient-sky text-primary-foreground shadow-[var(--shadow-float)]">
            <Plane className="size-4.5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-tight">AeroGuide</span>
            <span className="block text-[11px] text-muted-foreground">Terminal 3 · Passenger Assist</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success md:inline-flex">
            <motion.span
              className="size-1.5 rounded-full bg-success"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            Live
          </span>

          <div className="hidden sm:block">
            <LanguageSelector value={language} onChange={setLanguage} compact />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
                <Bell className="size-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-2xl p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
                <Button variant="ghost" size="sm" onClick={clearNotifications}>
                  Clear
                </Button>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-slim">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    You're all caught up.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="border-b border-border/60 px-4 py-3 last:border-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border/70 py-1 pl-1 pr-3 transition-colors hover:bg-muted">
                <Avatar className="size-8">
                  <AvatarFallback className="gradient-sky text-xs font-semibold text-primary-foreground">
                    {initials(user?.name ?? "Guest")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left leading-tight md:block">
                  <span className="block text-xs font-semibold">{user?.name ?? "Guest"}</span>
                  <span className="block text-[11px] text-muted-foreground">{user?.flightNumber}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {user?.email}
                <span className="mt-1 block font-medium text-foreground">{user?.frequentFlyerTier}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="capitalize">
                Assistance: {user?.accessibility}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
