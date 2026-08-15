import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame, Plus, Ruler, TrendingUp } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useProfile } from "@/hooks/useMuskly";
import { DAY_KEY_PREFIX, computePlan, todayKey, type DayLog } from "@/lib/muskly";
import { MEASUREMENT_FIELDS } from "@/lib/muskly-content";

export const Route = createFileRoute("/informe")({
  head: () => ({
    meta: [
      { title: "Informe | Muskly" },
      {
        name: "description",
        content: "Evolución de peso y masa muscular, mediciones y consistencia semanal.",
      },
      { property: "og:title", content: "Informe | Muskly" },
      {
        property: "og:description",
        content: "Evolución de peso y masa muscular, mediciones y consistencia semanal.",
      },
    ],
  }),
  component: InformePage,
});

const WEIGHT_KEY = "muskly.weights";
const MEASURE_KEY = "muskly.measures";

type WeightEntry = { date: string; kg: number };

function InformePage() {
  const { profile, loaded } = useProfile();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [measures, setMeasures] = useState<Record<string, number>>({});
  const [week, setWeek] = useState<DayLog[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WEIGHT_KEY);
      if (raw) setWeights(JSON.parse(raw) as WeightEntry[]);
      const rawM = localStorage.getItem(MEASURE_KEY);
      if (rawM) setMeasures(JSON.parse(rawM) as Record<string, number>);
      const days: DayLog[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = todayKey(d);
        const stored = localStorage.getItem(DAY_KEY_PREFIX + key);
        days.push(
          stored
            ? { ...(JSON.parse(stored) as DayLog), date: key }
            : {
                date: key,
                workoutDone: false,
                meals: { desayuno: false, almuerzo: false, cena: false, snack: false },
                water: 0,
              },
        );
      }
      setWeek(days);
    } catch {
      /* ignore */
    }
  }, []);

  const series = useMemo(() => {
    const base =
      weights.length > 0
        ? weights
        : profile
          ? [{ date: profile.createdAt.slice(0, 10), kg: profile.weight }]
          : [];
    return base.slice(-8);
  }, [weights, profile]);

  const saveWeight = () => {
    const kg = Math.round(Number(input));
    if (!kg || kg < 30 || kg > 250) return;
    const next = [...weights.filter((w) => w.date !== todayKey()), { date: todayKey(), kg }].sort(
      (a, b) => a.date.localeCompare(b.date),
    );
    setWeights(next);
    setInput("");
    try {
      localStorage.setItem(WEIGHT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const saveMeasure = (key: string, value: string) => {
    const next = { ...measures, [key]: Number(value) || 0 };
    setMeasures(next);
    try {
      localStorage.setItem(MEASURE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const current = series.at(-1)?.kg ?? profile?.weight ?? 0;
  const start = series[0]?.kg ?? profile?.weight ?? 0;
  const diff = current - start;
  const target = profile?.targetWeight ?? current;
  const goalPct =
    target !== start ? Math.max(0, Math.min(1, (current - start) / (target - start))) : 0;

  const workouts = week.filter((d) => d.workoutDone).length;
  const mealsPct =
    week.length > 0
      ? week.reduce((s, d) => s + Object.values(d.meals).filter(Boolean).length, 0) /
        (week.length * 4)
      : 0;
  const avgWater = week.length
    ? Math.round((week.reduce((s, d) => s + d.water, 0) / week.length) * 250)
    : 0;

  if (!loaded) {
    return (
      <AppShell>
        <ScreenHeader title="Informe" subtitle="Tu progreso" />
        <p className="px-5 text-sm text-muted-foreground">Cargando tu progreso…</p>
      </AppShell>
    );
  }

  const max = Math.max(...series.map((s) => s.kg), target) + 1;
  const min = Math.min(...series.map((s) => s.kg), start) - 1;

  return (
    <AppShell>
      <ScreenHeader title="Informe" subtitle="Cómo va tu transformación" />

      <section className="px-5">
        <div className="rounded-3xl bg-card p-5 shadow-[0_14px_44px_-28px_rgba(0,0,0,0.6)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Peso actual</p>
              <p className="font-display text-3xl font-bold">{current} kg</p>
            </div>
            <p
              className={`flex items-center gap-1 text-sm font-medium ${
                diff >= 0 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <TrendingUp size={15} />
              {diff >= 0 ? "+" : ""}
              {diff.toFixed(1)} kg
            </p>
          </div>

          <div className="mt-5 flex h-32 items-end gap-2">
            {series.map((s) => {
              const h = max === min ? 50 : ((s.kg - min) / (max - min)) * 100;
              return (
                <div key={s.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{s.kg}</span>
                  <div
                    className="w-full rounded-t-lg bg-primary/80 transition-all"
                    style={{ height: `${Math.max(8, h)}%` }}
                  />
                  <span className="truncate text-[10px] text-muted-foreground">
                    {s.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Registrar peso de hoy (kg)"
              className="input-muskly"
            />
            <button
              onClick={saveWeight}
              aria-label="Guardar peso"
              className="grid shrink-0 place-items-center rounded-2xl bg-primary px-4 text-primary-foreground"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-muted p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Meta: {target} kg</span>
              <span>{Math.round(goalPct * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${goalPct * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Constancia (7 días)</h2>
        <div className="mt-3 rounded-3xl bg-card p-5 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.6)]">
          <div className="flex justify-between">
            {week.map((d) => {
              const label = new Date(d.date + "T12:00:00")
                .toLocaleDateString("es-ES", { weekday: "narrow" })
                .toUpperCase();
              return (
                <div key={d.date} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-semibold ${
                      d.workoutDone
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="h-1.5 w-9 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary/70"
                      style={{
                        width: `${(Object.values(d.meals).filter(Boolean).length / 4) * 100}%`,
                      }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Entrenos" value={`${workouts}/7`} />
            <Stat label="Comidas" value={`${Math.round(mealsPct * 100)}%`} />
            <Stat label="Agua/día" value={`${avgWater} ml`} />
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Mediciones</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anótalas cada 2 semanas, en ayunas y con la misma cinta.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {MEASUREMENT_FIELDS.map((f) => (
            <label
              key={f.key}
              className="rounded-2xl bg-card p-3.5 shadow-[0_10px_36px_-30px_rgba(0,0,0,0.6)]"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Ruler size={12} /> {f.label}
              </span>
              <span className="mt-1 flex items-baseline gap-1">
                <input
                  inputMode="decimal"
                  value={measures[f.key] || ""}
                  onChange={(e) => saveMeasure(f.key, e.target.value)}
                  placeholder="0"
                  className="font-display w-full min-w-0 bg-transparent text-xl font-bold outline-none"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {profile ? (
        <section className="mt-6 px-5">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-primary">
              <Flame size={17} />
              <p className="font-display text-sm font-semibold">Lectura de tu progreso</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              {diff <= 0
                ? `Aún no subes de peso. Añade ~200 kcal a tus ${computePlan(profile).calories} kcal diarias y revisa que llegues a ${computePlan(profile).protein} g de proteína.`
                : diff > 0.7
                  ? "Estás subiendo rápido. Mantén el superávit moderado para ganar más músculo que grasa."
                  : "Ritmo ideal: subida lenta y constante. Sigue así y ajusta cada 2 semanas."}
            </p>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3 text-center">
      <p className="font-display text-base font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
