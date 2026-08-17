export type Goal = "volumen" | "definicion" | "fuerza";
export type Level = "principiante" | "intermedio" | "avanzado";
export type Sex = "hombre" | "mujer" | "otro";
export type ActivityLevel = "sedentario" | "ligera" | "moderada" | "muy_activa";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  ligera: 1.375,
  moderada: 1.55,
  muy_activa: 1.725,
};

export type Profile = {
  name: string;
  age: number;
  sex: Sex;
  weight: number; // kg
  height: number; // cm
  level: Level;
  daysPerWeek: number;
  activity?: ActivityLevel;
  goal: Goal;
  targetWeight: number;
  createdAt: string;
};

export type Plan = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number; // ml
};

export type DayLog = {
  date: string;
  workoutDone: boolean;
  meals: Record<"desayuno" | "almuerzo" | "cena" | "snack", boolean>;
  water: number; // vasos de 250ml
  exercisesDone?: number;
  exercisesTotal?: number;
  workoutTitle?: string;
};

export const PROFILE_KEY = "muskly.profile";
export const DAY_KEY_PREFIX = "muskly.day.";

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function emptyDay(date = todayKey()): DayLog {
  return {
    date,
    workoutDone: false,
    meals: { desayuno: false, almuerzo: false, cena: false, snack: false },
    water: 0,
  };
}

export function computePlan(p: Profile): Plan {
  const sexOffset = p.sex === "hombre" ? 5 : p.sex === "mujer" ? -161 : -78;
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + sexOffset;
  const base = p.activity ? ACTIVITY_FACTORS[p.activity] : 1.375;
  const activity = base + Math.min(p.daysPerWeek, 6) * 0.02;
  const maintenance = bmr * activity;
  const surplus = p.goal === "volumen" ? 400 : p.goal === "fuerza" ? 250 : 50;
  const calories = Math.round((maintenance + surplus) / 10) * 10;
  const protein = Math.round(p.weight * (p.goal === "definicion" ? 2.2 : 1.9));
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
  const water = Math.round((p.weight * 40) / 100) * 100;
  return { calories, protein, carbs, fats, water };
}

export const QUOTES = [
  "Cada repetición cuenta. Hoy construyes al tú de mañana.",
  "No necesitas ser el más fuerte, solo más constante que ayer.",
  "Comer bien también es entrenar. Tu cuerpo lo agradece.",
  "El progreso lento sigue siendo progreso. Confía en el proceso.",
  "Descansar no es rendirse: es parte del crecimiento muscular.",
  "Tu genética no decide tu esfuerzo. Tú sí.",
  "Un día a la vez, un plato a la vez, una serie a la vez.",
];

export function quoteOfTheDay(date = new Date()) {
  const index = Math.floor(date.getTime() / 86400000) % QUOTES.length;
  return QUOTES[index];
}

export type Tip = {
  title: string;
  body: string;
  source: string;
};

export const TIPS: Tip[] = [
  {
    title: "Apunta a 1.6–2.2 g de proteína por kg",
    body: "Por encima de ~1.6 g/kg al día las ganancias de masa magra se estabilizan. Reparte la proteína en 3–4 comidas.",
    source: "Morton et al., Br J Sports Med (2018) — metaanálisis de 49 estudios",
  },
  {
    title: "Entrena cerca del fallo, con técnica",
    body: "Dejar 1–3 repeticiones en reserva genera hipertrofia similar al fallo total, con menos fatiga acumulada.",
    source: "Refalo et al., J Sports Sci (2023)",
  },
  {
    title: "10–20 series semanales por grupo muscular",
    body: "El volumen semanal es el mayor motor de hipertrofia. Sube de forma progresiva, no de golpe.",
    source: "Schoenfeld et al., J Sports Sci (2017)",
  },
  {
    title: "Duerme 7–9 horas",
    body: "La restricción de sueño reduce la síntesis proteica y aumenta la pérdida de masa magra en déficit.",
    source: "Dattilo et al., Med Hypotheses (2011)",
  },
  {
    title: "Superávit calórico moderado",
    body: "Un excedente de 300–500 kcal favorece músculo minimizando la grasa. Más no es mejor.",
    source: "Slater et al., Front Nutr (2019)",
  },
];
