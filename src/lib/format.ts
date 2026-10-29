const MIN = 60_000;

/** "45 s", "12 min", "2 h 10 min". */
export function duration(ms: number) {
  if (ms < MIN) return `${Math.max(0, Math.round(ms / 1000))} s`;
  const minutes = Math.round(ms / MIN);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Clock time at the plants, e.g. "14:32". */
export function plantClock(ms: number) {
  return new Date(ms).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

export function percent(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

export function hours(ms: number) {
  const h = ms / 3_600_000;
  return h < 10 ? `${h.toFixed(1)} h` : `${Math.round(h)} h`;
}

export function dueDate(daysFromToday: number, today: number) {
  return new Date(today + daysFromToday * 86_400_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

const weekdayDate = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/** "Thu, 22 Oct", for days and weeks ahead. */
export const day = (ms: number) => weekdayDate.format(ms);

const weekdayTime = new Intl.DateTimeFormat("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

/** "Thu 16:00", for arrivals in the next few days. */
export const dayTime = (ms: number) => weekdayTime.format(ms);

/** "12,400" in the Indian grouping Lumax reports in ("1,28,000" for a lakh and more). */
export const num = (n: number) => Math.round(n).toLocaleString("en-IN");

/** Lower-cases the first letter to run a phrase into a sentence, leaving acronyms like "ADB" alone. */
export const lowerFirst = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

/** "1 order", "3 orders", "2,400 headlamps". */
export function count(n: number, singular: string, plural = `${singular}s`) {
  return `${num(n)} ${n === 1 ? singular : plural}`;
}

/** "₹2.4 crore", "₹38 lakh": rupee amounts the way Indian finance teams say them. */
export function rupees(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n >= 1e8 ? 0 : 1)} crore`;
  if (n >= 1e5) return `₹${Math.round(n / 1e5)} lakh`;
  return `₹${num(n)}`;
}
