import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, Droplets, Pill, Utensils } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
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

function NutricionPage() {
  const { profile, loaded } = useProfile();
  const { day, update } = useDayLog();
  const plan = useMemo(() => (profile ? computePlan(profile) : null), [profile]);

  if (!loaded || !profile || !plan) {
    return (
      <AppShell>
        <ScreenHeader title="Nutrición" subtitle="Tu plan para crecer" />
        <p className="px-5 text-sm text-muted-foreground">Cargando tu plan…</p>
      </AppShell>
    );
  }

  const mealsDone = Object.values(day.meals).filter(Boolean).length;
  const caloriesDone = MEAL_TEMPLATES.filter((m) => day.meals[m.key]).reduce(
    (sum, m) => sum + m.share * plan.calories,
    0,
  );

  return (
    <AppShell>
      <ScreenHeader
        title="Nutrición"
        subtitle={`${plan.calories} kcal para ganar músculo hoy`}
      />

      <section className="px-5">
        <div className="rounded-3xl bg-card p-5 shadow-[0_14px_44px_-28px_rgba(0,0,0,0.6)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Consumido hoy</p>
              <p className="font-display text-3xl font-bold">
                {Math.round(caloriesDone)}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  / {plan.calories} kcal
                </span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{mealsDone}/4 comidas</p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (caloriesDone / plan.calories) * 100)}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Macro label="Proteína" value={`${plan.protein} g`} pct={mealsDone / 4} />
            <Macro label="Carbos" value={`${plan.carbs} g`} pct={mealsDone / 4} />
            <Macro label="Grasas" value={`${plan.fats} g`} pct={mealsDone / 4} />
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Menú de hoy</h2>
        <div className="mt-3 space-y-2.5">
          {MEAL_TEMPLATES.map((meal) => {
            const done = day.meals[meal.key];
            return (
              <article
                key={meal.key}
                className="rounded-3xl bg-card p-4 shadow-[0_10px_36px_-28px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Utensils size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold">{meal.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {meal.time} · {Math.round(meal.share * plan.calories)} kcal ·{" "}
                      {Math.round(meal.share * plan.protein)} g proteína
                    </p>
                  </div>
                  <button
                    aria-pressed={done}
                    aria-label={`Marcar ${meal.label}`}
                    onClick={() => update({ meals: { ...day.meals, [meal.key]: !done } })}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <Check size={15} />
                  </button>
                </div>
                <ul className="mt-3 space-y-1 border-t border-border pt-3">
                  {meal.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground">
                      · {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Alimentos clave</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Baratos, densos en calorías y fáciles de repetir.
        </p>
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

function Macro({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-base font-semibold">{value}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-card">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}
