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

/** "1 order", "3 orders". */
export function count(n: number, singular: string, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}
