import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Check, Droplets, Moon, Pill, Sun, Sunrise, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useDayLog, useProfile } from "@/hooks/useMuskly";
import { computePlan } from "@/lib/muskly";
import { KEY_FOODS, MEAL_TEMPLATES, SUPPLEMENTS } from "@/lib/muskly-content";

export const Route = createFileRoute("/nutricion")({
  head: () => ({
    meta: [
      { title: "Nutrición | Muskly" },
      {
        name: "description",
        content: "Plan nutricional para hipertrofia con menú diario y control de macros.",
      },
      { property: "og:title", content: "Nutrición | Muskly" },
      {
        property: "og:description",
        content: "Plan nutricional para hipertrofia con menú diario y control de macros.",
      },
    ],
  }),
  component: NutricionPage,
});

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MEAL_ICONS = {
  desayuno: Sunrise,
  almuerzo: Sun,
  snack: Zap,
  cena: Moon,
} as const;

function weekDays() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function NutricionPage() {
  const { profile, loaded } = useProfile();
  const { day, update } = useDayLog();
  const plan = useMemo(() => (profile ? computePlan(profile) : null), [profile]);
  const days = useMemo(weekDays, []);
  const [selected, setSelected] = useState(() => new Date().getDay());

  if (!loaded || !profile || !plan) {
    return (
      <AppShell>
        <p className="px-5 pt-10 text-sm text-muted-foreground">Cargando tu plan…</p>
      </AppShell>
    );
  }

  const mealsDone = Object.values(day.meals).filter(Boolean).length;
  const caloriesDone = Math.round(
    MEAL_TEMPLATES.filter((m) => day.meals[m.key]).reduce(
      (sum, m) => sum + m.share * plan.calories,
      0,
    ),
  );
  const ratio = Math.min(1, caloriesDone / plan.calories);
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <AppShell>
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <h1 className="font-display text-2xl font-bold">Nutrición</h1>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-card text-foreground shadow-[0_10px_30px_-24px_rgba(0,0,0,0.7)]">
          <CalendarDays size={19} />
        </span>
      </header>

      <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((d) => {
          const active = d.getDay() === selected;
          return (
            <button
              key={d.toDateString()}
              onClick={() => setSelected(d.getDay())}
              className={`flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-3 py-3 transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_var(--primary)]"
                  : "bg-card text-muted-foreground shadow-[0_10px_30px_-26px_rgba(0,0,0,0.7)]"
              }`}
            >
              <span className="text-xs">{DAY_LABELS[d.getDay()]}</span>
              <span
                className={`font-display text-lg font-bold ${active ? "" : "text-foreground"}`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <section className="mt-4 px-5">
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_22px_44px_-28px_var(--primary)]">
          <p className="font-display text-base font-semibold">Resumen de calorías</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="opacity-30"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - ratio)}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-display text-2xl font-bold">
                    {caloriesDone.toLocaleString("es-PE")}
                  </p>
                  <p className="text-xs opacity-80">/ {plan.calories} kcal</p>
                </div>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-3">
              <MacroRow label="Proteína" value={`${Math.round(plan.protein * (mealsDone / 4))} / ${plan.protein}g`} />
              <MacroRow label="Carbos" value={`${Math.round(plan.carbs * (mealsDone / 4))} / ${plan.carbs}g`} />
              <MacroRow label="Grasas" value={`${Math.round(plan.fats * (mealsDone / 4))} / ${plan.fats}g`} />
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Comidas</h2>
          <span className="text-sm text-muted-foreground">{mealsDone}/4 completas</span>
        </div>
        <div className="mt-3 space-y-2.5">
          {MEAL_TEMPLATES.map((meal) => {
            const done = day.meals[meal.key];
            const Icon = MEAL_ICONS[meal.key as keyof typeof MEAL_ICONS] ?? Sun;
            return (
              <button
                key={meal.key}
                onClick={() => update({ meals: { ...day.meals, [meal.key]: !done } })}
                aria-pressed={done}
                className="flex w-full items-center gap-3 rounded-3xl bg-card p-4 text-left shadow-[0_12px_38px_-30px_rgba(0,0,0,0.7)]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold">{meal.label}</p>
                  <p className="truncate text-sm text-muted-foreground">{meal.items[0]}</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {Math.round(meal.share * plan.calories)}{" "}
                    <span className="text-muted-foreground">kcal</span>
                  </p>
                </div>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Check size={15} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Alimentos clave</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {KEY_FOODS.map((f) => (
            <div
              key={f.name}
              className="rounded-2xl bg-card p-3.5 shadow-[0_10px_36px_-30px_rgba(0,0,0,0.6)]"
            >
              <p className="text-xl">{f.emoji}</p>
              <p className="mt-1 font-medium">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Hidratación</h2>
        <div className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 shadow-[0_10px_36px_-28px_rgba(0,0,0,0.6)]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Droplets size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {day.water * 250} ml de {plan.water} ml
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, ((day.water * 250) / plan.water) * 100)}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => update({ water: day.water + 1 })}
            className="shrink-0 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            + Vaso
          </button>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Suplementación</h2>
        <div className="mt-3 space-y-2.5">
          {SUPPLEMENTS.map((s) => (
            <div
              key={s.name}
              className="flex gap-3 rounded-2xl bg-card p-4 shadow-[0_10px_36px_-30px_rgba(0,0,0,0.6)]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Pill size={16} />
              </span>
              <div className="min-w-0">
                <p className="font-medium">
                  {s.name} <span className="text-sm text-muted-foreground">· {s.dose}</span>
                </p>
                <p className="text-sm text-muted-foreground">{s.why}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function MacroRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="h-2 w-2 rounded-full bg-primary-foreground/70" />
      <span className="flex-1">{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  );
}
