export const SESSION_KEY = "muskly.sessions";

export type WorkoutSession = {
  id: string;
  /** ISO datetime */
  at: string;
  title: string;
  exercises: number;
  seconds: number;
  kcal: number;
};

export function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as WorkoutSession[];
    return Array.isArray(list) ? list.sort((a, b) => b.at.localeCompare(a.at)) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: Omit<WorkoutSession, "id" | "at"> & { at?: string }) {
  try {
    const list = loadSessions();
    const entry: WorkoutSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: session.at ?? new Date().toISOString(),
      title: session.title,
      exercises: session.exercises,
      seconds: session.seconds,
      kcal: session.kcal,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify([entry, ...list].slice(0, 200)));
    return entry;
  } catch {
    return null;
  }
}

export function formatClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Monday-based start of the week for a date */
export function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}
