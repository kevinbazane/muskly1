import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Bell, Check, ChevronRight, Dumbbell, Quote } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useDayLog, useProfile } from "@/hooks/useMuskly";
import { MEAL_TEMPLATES, ROUTINES } from "@/lib/muskly-content";
import { TIPS, computePlan, quoteOfTheDay } from "@/lib/muskly";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muskly | Tu diario para ganar masa muscular" },
      {
        name: "description",
        content:
          "Registra entrenamientos, comidas y agua, y recibe consejos validados para ganar músculo siendo delgado.",
      },
      { property: "og:title", content: "Muskly | Tu diario para ganar masa muscular" },
      {
        property: "og:description",
        content: "Tu día a día para ganar músculo de forma saludable y constante.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Diario,
});

function Ring({
  value,
  size = 64,
  stroke = 7,
  label,
  tone = "primary",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: "primary" | "light";
}) {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={tone === "light" ? "stroke-muted" : "stroke-primary-foreground/25"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="stroke-primary transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold">
        {label ?? `${Math.round(pct * 100)}%`}
      </span>
    </div>
  );
}

function Diario() {
  const { profile, loaded } = useProfile();
  const { day } = useDayLog();
  const navigate = useNavigate();

  useEffect(() => {
    if (loaded && !profile) navigate({ to: "/onboarding" });
  }, [loaded, profile, navigate]);

  const plan = useMemo(() => (profile ? computePlan(profile) : null), [profile]);

  const workout = useMemo(() => {
    const list = ROUTINES.gimnasio;
    const idx = (new Date().getDay() + 6) % 7;
    return list[Math.min(idx, list.length - 1)]!;
  }, []);

  if (!loaded || !profile || !plan) {
    return (
      <AppShell>
        <div className="px-5 pt-16 text-sm text-muted-foreground">Preparando tu día…</div>
      </AppShell>
    );
  }

  const total = day.exercisesTotal ?? workout.exercises.length;
  const doneCount = day.workoutDone ? total : Math.min(day.exercisesDone ?? 0, total);
  const remaining = Math.max(0, total - doneCount);
  const workoutPct = total ? doneCount / total : 0;
  const workoutKcalTotal = workout.exercises.length * 55 + 60;
  const workoutKcalDone = Math.round(workoutKcalTotal * workoutPct);

  const caloriesDone = Math.round(
    MEAL_TEMPLATES.filter((m) => day.meals[m.key]).reduce((s, m) => s + m.share * plan.calories, 0),
  );
  const mealsRatio = MEAL_TEMPLATES.filter((m) => day.meals[m.key]).reduce(
    (s, m) => s + m.share,
    0,
  );
  const proteinDone = Math.round(plan.protein * mealsRatio);
  const waterMl = day.water * 250;

  const dateLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-8">
        <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/15 text-lg font-bold text-primary">
          {profile.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground first-letter:uppercase">{dateLabel}</p>
          <h1 className="font-display truncate text-xl font-bold">
            Hola, {profile.name} <span aria-hidden>👋</span>
          </h1>
        </div>
        <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-card text-muted-foreground shadow-[0_10px_30px_-24px_rgba(0,0,0,0.8)]">
          <Bell size={18} />
          {remaining > 0 ? (
            <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {remaining}
            </span>
          ) : null}
        </span>
      </header>

      {/* Progreso de entrenamiento */}
      <section className="mt-5 px-5">
        <Link
          to="/ejercicios"
          className="flex items-center gap-4 rounded-3xl bg-foreground p-5 text-background shadow-[0_22px_50px_-30px_rgba(0,0,0,0.9)]"
        >
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold">
              {day.workoutDone ? "Entrenamiento completado" : "Progreso del entrenamiento"}
            </p>
            <p className="mt-1 truncate text-sm text-background/70">
              {day.workoutDone
                ? `${total} ejercicios · ¡buen trabajo!`
                : remaining === total
                  ? `${total} ejercicios por hacer hoy`
                  : `Te faltan ${remaining} ejercicios`}
            </p>
          </div>
          {day.workoutDone ? (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check size={28} />
            </span>
          ) : (
            <div className="text-background">
              <Ring value={workoutPct} size={68} />
            </div>
          )}
        </Link>
      </section>

      {/* Actividad de hoy */}
      <section className="mt-7 px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Actividad de hoy</h2>
        </div>

        <div className="mt-3 grid grid-cols-[104px_1fr] gap-3">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-4 text-primary-foreground">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-foreground/20">
              <Dumbbell size={20} />
            </span>
            <p className="font-display mt-8 text-xl font-bold">
              {workoutKcalDone.toLocaleString("es-PE")}
            </p>
            <p className="text-xs opacity-85">de {workoutKcalTotal} kcal</p>
          </div>

          <ul className="space-y-3 rounded-3xl bg-card p-4 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.6)]">
            {workout.exercises.slice(0, 3).map((ex, i) => (
              <li key={ex.name} className="flex items-center gap-3">
                <span
                  className={`h-8 w-1.5 shrink-0 rounded-full ${
                    i < doneCount ? "bg-primary" : "bg-muted"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-medium ${i < doneCount ? "text-muted-foreground line-through" : ""}`}
                  >
                    {ex.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{ex.muscle}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">
                  {ex.reps} <span className="text-xs text-muted-foreground">x{ex.sets}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Estado del día */}
      <section className="mt-7 px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Estado del día</h2>
          <Link
            to="/nutricion"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
          >
            Ver más <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-3 space-y-3 rounded-3xl bg-card p-4 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.6)]">
          <StatusRow
            emoji="🔥"
            label="Calorías"
            value={`${caloriesDone.toLocaleString("es-PE")} kcal`}
            goal={`de ${plan.calories}`}
            ratio={caloriesDone / plan.calories}
          />
          <StatusRow
            emoji="🍗"
            label="Proteína"
            value={`${proteinDone} g`}
            goal={`de ${plan.protein} g`}
            ratio={proteinDone / plan.protein}
          />
          <StatusRow
            emoji="💧"
            label="Agua"
            value={`${waterMl} ml`}
            goal={`de ${plan.water} ml`}
            ratio={waterMl / plan.water}
          />
        </div>
      </section>

      {/* Frase */}
      <section className="mt-7 px-5">
        <div className="flex gap-3 rounded-3xl bg-primary/10 p-5">
          <Quote size={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed font-medium">{quoteOfTheDay()}</p>
        </div>
      </section>

      {/* Tips */}
      <section className="mt-7 px-5">
        <h2 className="font-display text-lg font-semibold">Tips &amp; consejos validados</h2>
        <p className="mt-1 text-sm text-muted-foreground">Con fuentes científicas revisadas.</p>
        <div className="-mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
          {TIPS.map((tip) => (
            <article
              key={tip.title}
              className="w-64 shrink-0 snap-start rounded-3xl bg-card p-5 shadow-[0_12px_40px_-26px_rgba(0,0,0,0.6)]"
            >
              <p className="font-display text-base font-semibold">{tip.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{tip.body}</p>
              <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                Fuente: {tip.source}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function StatusRow({
  emoji,
  label,
  value,
  goal,
  ratio,
}: {
  emoji: string;
  label: string;
  value: string;
  goal: string;
  ratio: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-xl">
        <span aria-hidden>{emoji}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display truncate text-base font-bold">
          {value} <span className="text-xs font-normal text-muted-foreground">{goal}</span>
        </p>
      </div>
      <Ring value={ratio} size={52} stroke={6} tone="light" />
    </div>
  );
}
