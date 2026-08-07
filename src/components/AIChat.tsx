import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Footprints, Mic, Route, SendHorizonal, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Find nearest coffee",
  "Where is Gate A12?",
  "How long to security?",
  "Find wheelchair assistance",
  "Lost baggage",
];

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export function AIChat() {
  const { messages, isThinking, ask } = useUser();
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    void ask(input);
    setInput("");
  };

  const startVoice = () => {
    setListening(true);
    toast("Listening…", { description: "Voice search is a demo in this preview." });
    setTimeout(() => {
      setListening(false);
      setInput("Find nearest coffee");
    }, 1600);
  };

  return (
    <section className="flex h-[560px] flex-col rounded-3xl card-elevated" aria-label="AI assistant">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-9 place-items-center rounded-xl gradient-sky text-primary-foreground">
          <Bot className="size-4.5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Airport Assistant</h2>
          <p className="text-xs text-muted-foreground">Powered by real-time terminal data</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 scrollbar-slim">
        {messages.length === 0 && !isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid h-full place-items-center text-center"
          >
            <div className="max-w-sm">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary float-soft">
                <Sparkle className="size-6" />
              </span>
              <p className="mt-4 text-sm font-semibold">Ask me anything about the airport</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Directions, wait times, amenities and assistance — in your language.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${m.role === "user" ? "text-right" : ""}`}>
                <div
                  className={
                    m.role === "user"
                      ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-foreground"
                  }
                >
                  {m.text}
                </div>

                {m.steps && (
                  <div className="mt-2 rounded-2xl border border-border bg-card p-3 text-left">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Route className="size-3.5" /> Step-by-step
                    </p>
                    <ol className="mt-2 space-y-1.5">
                      {m.steps.map((s, i) => (
                        <li key={s} className="flex gap-2 text-xs">
                          <span className="grid size-4.5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 flex gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 font-medium text-success">
                        <Footprints className="size-3" /> {m.estimatedTime}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                        {m.distance}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <TypingDots />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void ask(s)}
              disabled={isThinking}
              className="rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about the airport..."
            aria-label="Ask the airport assistant"
            className="h-11 rounded-full"
          />
          <Button
            type="button"
            size="icon"
            variant={listening ? "default" : "outline"}
            onClick={startVoice}
            aria-label="Voice search"
            className={`size-11 shrink-0 rounded-full ${listening ? "pulse-ring" : ""}`}
          >
            <Mic className="size-4.5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={isThinking || !input.trim()}
            aria-label="Send message"
            className="size-11 shrink-0 rounded-full"
          >
            <SendHorizonal className="size-4.5" />
          </Button>
        </form>
      </div>
    </section>
  );
}
