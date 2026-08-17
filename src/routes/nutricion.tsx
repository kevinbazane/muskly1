import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Check, Clock, Droplets, Pill, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useDayLog, useProfile } from "@/hooks/useMuskly";
import { computePlan } from "@/lib/muskly";
import { MEAL_TEMPLATES, SUPPLEMENTS } from "@/lib/muskly-content";
import { FOOD_TYPES, MEAL_TABS, RECIPES, type MealKey, type Recipe } from "@/lib/muskly-recipes";


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
  const [mealTab, setMealTab] = useState<MealKey | "todos">("todos");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);


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

      <section className="mt-6">
        <div className="flex items-baseline justify-between px-5">
          <h2 className="font-display text-lg font-semibold">Tipos de alimentos</h2>
          {typeFilter && (
            <button
              onClick={() => setTypeFilter(null)}
              className="text-sm font-medium text-primary"
            >
              Ver todos
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FOOD_TYPES.map((t) => {
            const active = typeFilter === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTypeFilter(active ? null : t.key)}
                className="w-[116px] shrink-0 text-left"
              >
                <img
                  src={t.image}
                  alt={t.label}
                  loading="lazy"
                  width={512}
                  height={512}
                  className={`h-[86px] w-full rounded-2xl object-cover transition-all ${
                    active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                />
                <p
                  className={`mt-2 rounded-xl px-2 py-1 text-center text-sm font-medium ${
                    active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                  }`}
                >
                  {t.label}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-5 font-display text-lg font-semibold">Categorías inteligentes</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ key: "todos" as const, label: "Ver todo" }, ...MEAL_TABS].map((t) => {
            const active = mealTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setMealTab(t.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground shadow-[0_10px_30px_-26px_rgba(0,0,0,0.7)]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 px-5">
          {RECIPES.filter(
            (r) =>
              (mealTab === "todos" || r.meal === mealTab) &&
              (!typeFilter || r.type === typeFilter),
          ).map((r) => (
            <button
              key={r.key}
              onClick={() => setOpenRecipe(r)}
              className="overflow-hidden rounded-3xl bg-card text-left shadow-[0_14px_40px_-30px_rgba(0,0,0,0.7)]"
            >
              <div className="relative">
                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  width={768}
                  height={576}
                  className="h-[104px] w-full object-cover"
                />
                <span className="absolute left-2 top-2 rounded-lg bg-card/90 px-2 py-0.5 text-xs font-medium">
                  {r.tag}
                </span>
              </div>
              <div className="p-3">
                <p className="font-display font-semibold leading-tight">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} /> {r.minutes} min · {r.kcal} kcal
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>


      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold">Hidratación</h2>
        <div className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 shadow-[0_10px_36px_-28px_rgba(0,0,0,0.6)]">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Droplets size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold">Agua</p>
            <p className="text-sm text-muted-foreground">
              {day.water} {day.water === 1 ? "vaso" : "vasos"} · {day.water * 250} ml
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, ((day.water * 250) / plan.water) * 100)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            aria-label="Quitar un vaso"
            disabled={day.water === 0}
            onClick={() => update({ water: Math.max(0, day.water - 1) })}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-opacity disabled:opacity-40"
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            aria-label="Añadir un vaso"
            onClick={() => update({ water: day.water + 1 })}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-foreground"
          >
            <Plus size={18} />
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

      {openRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-[2px]"
          onClick={() => setOpenRecipe(null)}
        >
          <div
            role="dialog"
            aria-label={openRecipe.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-[2rem] bg-background pb-8"
          >
            <div className="relative">
              <img
                src={openRecipe.image}
                alt={openRecipe.name}
                width={768}
                height={576}
                className="h-52 w-full rounded-t-[2rem] object-cover"
              />
              <button
                onClick={() => setOpenRecipe(null)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-card text-foreground"
              >
                <X size={17} />
              </button>
            </div>

            <div className="px-5 pt-4">
              <p className="text-sm text-primary">{openRecipe.tag}</p>
              <h3 className="font-display text-2xl font-bold">{openRecipe.name}</h3>
              <p className="text-sm text-muted-foreground">{openRecipe.subtitle}</p>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Stat label="min" value={String(openRecipe.minutes)} />
                <Stat label="kcal" value={String(openRecipe.kcal)} />
                <Stat label="proteína" value={`${openRecipe.protein}g`} />
                <Stat label="carbos" value={`${openRecipe.carbs}g`} />
              </div>

              <h4 className="mt-6 font-display text-lg font-semibold">Ingredientes</h4>
              <ul className="mt-2 space-y-2">
                {openRecipe.ingredients.map((ing) => (
                  <li key={ing} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  update({
                    meals: { ...day.meals, [openRecipe.meal]: !day.meals[openRecipe.meal] },
                  });
                  setOpenRecipe(null);
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-medium text-primary-foreground"
              >
                <Check size={17} />
                {day.meals[openRecipe.meal]
                  ? `Desmarcar ${openRecipe.meal}`
                  : `Marcar como ${openRecipe.meal}`}
              </button>
            </div>
          </div>
        </div>
      )}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card py-3 shadow-[0_10px_30px_-28px_rgba(0,0,0,0.7)]">
      <p className="font-display text-base font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
