import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  FileUp,
  Keyboard,
  Loader2,
  ScanLine,
  TriangleAlert,
} from "lucide-react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseGenericPayload } from "@/lib/bcbp";
import type { BoardingPass } from "@/lib/types";
import { useUser } from "@/context/UserContext";

const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketScannerModal({ open, onOpenChange }: Props) {
  const { t, applyBoardingPass } = useUser();
  const [tab, setTab] = useState("camera");
  const [result, setResult] = useState<BoardingPass | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [manual, setManual] = useState("");
  const [dragging, setDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Always tear the camera stream down — on close, success, tab change. */
  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);
  useEffect(() => {
    if (!open) {
      stopCamera();
      setError(null);
      setBusy(false);
    }
  }, [open, stopCamera]);

  const handlePayload = useCallback(
    (payload: string) => {
      const parsed = parseGenericPayload(payload);
      if (!parsed) {
        setError(t("parse_failed"));
        return false;
      }
      stopCamera();
      setError(null);
      setResult(parsed);
      return true;
    },
    [stopCamera, t],
  );

  const startCamera = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current ?? undefined,
        (res) => {
          if (res) handlePayload(res.getText());
        },
      );
      setCameraOn(true);
    } catch (err) {
      const name = (err as Error)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") setError(t("camera_denied"));
      else if (name === "NotFoundError" || name === "OverconstrainedError")
        setError(t("camera_unavailable"));
      else setError(t("camera_unavailable"));
      stopCamera();
    } finally {
      setBusy(false);
    }
  }, [handlePayload, stopCamera, t]);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_BYTES) return setError(t("file_too_large"));
      if (file.type === "application/pdf") return setError(t("pdf_not_supported"));
      if (!IMAGE_TYPES.includes(file.type)) return setError(t("unsupported_file"));

      setBusy(true);
      const url = URL.createObjectURL(file);
      try {
        const reader = new BrowserMultiFormatReader();
        const res = await reader.decodeFromImageUrl(url);
        handlePayload(res.getText());
      } catch {
        setError(t("parse_failed"));
      } finally {
        URL.revokeObjectURL(url);
        setBusy(false);
      }
    },
    [handlePayload, t],
  );

  const reset = () => {
    setResult(null);
    setError(null);
    setManual("");
  };

  const close = () => {
    stopCamera();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) stopCamera();
        onOpenChange(next);
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-5 text-primary" /> {t("scan_boarding_pass")}
          </DialogTitle>
          <DialogDescription>{t("scanner_desc")}</DialogDescription>
        </DialogHeader>

        <div aria-live="polite" className="sr-only">
          {error ?? (result ? t("scanned_title") : "")}
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-success/30 bg-success/5 p-5 text-center">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="mx-auto grid size-12 place-items-center rounded-full bg-success/15 text-success"
                >
                  <CheckCircle2 className="size-6" />
                </motion.span>
                <p className="mt-3 text-sm font-semibold">{t("scanned_title")}</p>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-sm">
                {(
                  [
                    ["passenger", result.passengerName],
                    ["flight", result.flightNumber],
                    ["gate", result.gate],
                    ["terminal", result.terminal],
                    ["destination", result.destination],
                    ["departure", result.departureTime],
                    ["boarding", result.boardingTime],
                  ] as const
                ).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-border bg-card p-3">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t(key)}
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {value
                        ? key === "departure" || key === "boarding"
                          ? new Date(value).toLocaleString()
                          : value
                        : <span className="text-muted-foreground">{t("unknown")}</span>}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="h-12 flex-1 rounded-xl"
                  onClick={() => {
                    applyBoardingPass(result);
                    close();
                    reset();
                  }}
                >
                  {t("continue_to_dashboard")}
                </Button>
                <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={reset}>
                  {t("scan_another")}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  if (v !== "camera") stopCamera();
                  setError(null);
                  setTab(v);
                }}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="camera" className="h-10 gap-1.5">
                    <Camera className="size-4" /> {t("camera")}
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="h-10 gap-1.5">
                    <FileUp className="size-4" /> {t("upload")}
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="h-10 gap-1.5">
                    <Keyboard className="size-4" /> {t("enter_code")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="mt-4 space-y-3">
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                    <video
                      ref={videoRef}
                      className="size-full object-cover"
                      muted
                      playsInline
                      aria-label={t("position_pass")}
                    />
                    {!cameraOn && (
                      <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                        <CameraOff className="size-8" />
                      </div>
                    )}
                    {cameraOn && (
                      <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-primary/80">
                        <motion.span
                          className="absolute inset-x-0 h-0.5 bg-primary"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm text-muted-foreground">{t("position_pass")}</p>
                  <p className="text-center text-xs text-muted-foreground">
                    {t("camera_permission_hint")}
                  </p>
                  <Button
                    className="h-12 w-full rounded-xl"
                    onClick={() => (cameraOn ? stopCamera() : void startCamera())}
                    disabled={busy}
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                    {cameraOn ? t("stop_camera") : t("start_camera")}
                  </Button>
                </TabsContent>

                <TabsContent value="upload" className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) void handleFile(file);
                    }}
                    className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 transition-colors ${
                      dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      {busy ? <Loader2 className="size-5 animate-spin" /> : <FileUp className="size-5" />}
                    </span>
                    <span className="text-sm font-medium">
                      {busy ? t("reading_file") : t("drop_here")}
                    </span>
                    <span className="text-xs text-muted-foreground">{t("or_click_browse")}</span>
                    <span className="text-[11px] text-muted-foreground">{t("accepted_formats")}</span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    aria-label={t("upload_boarding_pass")}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(file);
                      e.target.value = "";
                    }}
                  />
                </TabsContent>

                <TabsContent value="manual" className="mt-4 space-y-3">
                  <Label htmlFor="bcbp-input" className="text-sm">
                    {t("manual_label")}
                  </Label>
                  <Input
                    id="bcbp-input"
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="M1LIN/MAYA EEK0385"
                    className="h-12 rounded-xl font-mono"
                  />
                  <Button
                    className="h-12 w-full rounded-xl"
                    disabled={!manual.trim()}
                    onClick={() => handlePayload(manual)}
                  >
                    <ScanLine className="size-4" /> {t("parse_pass")}
                  </Button>
                </TabsContent>
              </Tabs>

              {error && (
                <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <TriangleAlert className="size-4" /> {error}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() => {
                        setError(null);
                        setTab("upload");
                      }}
                    >
                      {t("try_another_image")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() => {
                        setError(null);
                        setTab("camera");
                      }}
                    >
                      {t("use_camera")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() => {
                        setError(null);
                        setTab("manual");
                      }}
                    >
                      {t("enter_manually")}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
