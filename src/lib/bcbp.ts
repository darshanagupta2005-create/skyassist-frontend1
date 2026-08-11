import type { BoardingPass } from "./types";

/** Day-of-year → ISO date in the current (or next) year. */
function julianToIso(julian: string): string | null {
  const day = Number(julian);
  if (!Number.isFinite(day) || day < 1 || day > 366) return null;
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), 0, day));
  return date.toISOString();
}

const AIRPORTS: Record<string, string> = {};

/**
 * Parses an IATA BCBP (Bar Coded Boarding Pass, "M1…") payload.
 * Only fields actually present in the payload are returned — nothing is invented.
 */
export function parseBcbp(raw: string): BoardingPass | null {
  const s = raw.trim();
  if (!/^M\d/.test(s) || s.length < 60) return null;

  const name = s.slice(2, 22).trim();
  const body = s.slice(23); // after the 'E'/'>' electronic-ticket indicator
  const pnr = body.slice(0, 7).trim();
  const from = body.slice(7, 10).trim();
  const to = body.slice(10, 13).trim();
  const carrier = body.slice(13, 16).trim();
  const flightNo = body.slice(16, 21).trim().replace(/^0+/, "");
  const julian = body.slice(21, 24).trim();
  const seat = body.slice(25, 29).trim().replace(/^0+/, "");

  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) return null;

  const [last, first] = name.split("/");
  const passengerName = name
    ? [first, last].filter(Boolean).join(" ").replace(/\s+/g, " ").trim()
    : null;

  return {
    passengerName: passengerName || null,
    flightNumber: carrier && flightNo ? `${carrier.replace(/\s/g, "")} ${flightNo}` : null,
    gate: null,
    terminal: null,
    origin: from || null,
    destination: AIRPORTS[to] ?? to ?? null,
    seat: seat || null,
    bookingRef: pnr || null,
    departureTime: julianToIso(julian),
    boardingTime: null,
    rawPayload: raw,
  };
}

/**
 * Best-effort parser for free-form payloads (QR codes from airline apps,
 * manually typed references). Extracts only what it can actually match.
 */
export function parseGenericPayload(raw: string): BoardingPass | null {
  const s = raw.trim();
  if (!s) return null;

  const bcbp = parseBcbp(s);
  if (bcbp) return bcbp;

  const upper = s.toUpperCase();
  const flight = upper.match(/\b([A-Z]{2}[A-Z0-9]?)\s?(\d{1,4})\b/);
  const seat = upper.match(/\bSEAT[:\s]*([0-9]{1,3}[A-K])\b/) ?? upper.match(/\b(\d{1,2}[A-K])\b/);
  const gate = upper.match(/\bGATE[:\s]*([A-Z]?\d{1,3}[A-Z]?)\b/);
  const terminal = upper.match(/\bTERMINAL[:\s]*([A-Z0-9]{1,2})\b/) ?? upper.match(/\bT(\d)\b/);
  const pnr = upper.match(/\b(?:PNR|REF)[:\s]*([A-Z0-9]{5,7})\b/);
  const route = upper.match(/\b([A-Z]{3})\s*(?:-|→|>|TO)\s*([A-Z]{3})\b/);
  const name = s.match(/\b([A-Z]+)\/([A-Z]+)\b/);

  const anything = flight || gate || terminal || pnr || route || name;
  if (!anything) return null;

  return {
    passengerName: name ? `${name[2]} ${name[1]}`.trim() : null,
    flightNumber: flight ? `${flight[1]} ${flight[2]}` : null,
    gate: gate ? gate[1]! : null,
    terminal: terminal ? terminal[1]! : null,
    origin: route ? route[1]! : null,
    destination: route ? route[2]! : null,
    seat: seat ? seat[1]! : null,
    bookingRef: pnr ? pnr[1]! : null,
    departureTime: null,
    boardingTime: null,
    rawPayload: raw,
  };
}
