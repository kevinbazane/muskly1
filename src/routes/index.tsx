import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Check,
  Droplets,
  Dumbbell,
  Flame,
  Minus,
  Plus,
  Quote,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useDayLog, useProfile } from "@/hooks/useMuskly";
import { TIPS, computePlan, quoteOfTheDay, type DayLog, type Plan } from "@/lib/muskly";

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
    ],
  }),
  component: Diario,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function Diario() {
  const { profile, loaded } = useProfile();
  const { day, update } = useDayLog();
  const navigate = useNavigate();

  useEffect(() => {
    if (loaded && !profile) navigate({ to: "/onboarding" });
  }, [loaded, profile, navigate]);

  const plan = useMemo(() => (profile ? computePlan(profile) : null), [profile]);

  if (!loaded || !profile || !plan) {
    return (
      <AppShell>
        <div className="px-5 pt-16 text-sm text-muted-foreground">Preparando tu día…</div>
      </AppShell>
    );
  }

  const mealsDone = Object.values(day.meals).filter(Boolean).length;
  const waterMl = day.water * 250;
  const caloriesDone = Math.round((mealsDone / 4) * plan.calories);
  const proteinDone = Math.round((mealsDone / 4) * plan.protein);

  const dateLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell>
      <header className="px-5 pt-8">
        <p className="text-sm text-muted-foreground capitalize">{dateLabel}</p>
        <h1 className="font-display mt-1 text-2xl font-bold">
          {greeting()}, {profile.name}
        </h1>
      </header>

      <section className="mt-5 px-5">
        <div className="flex gap-3 rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_20px_50px_-26px_var(--primary)]">
          <Quote size={20} className="mt-0.5 shrink-0 opacity-80" />
          <p className="text-sm leading-relaxed font-medium">{quoteOfTheDay()}</p>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 px-5">
        <StatCard
          icon={<Flame size={18} />}
          label="Calorías"
          value={`${caloriesDone}`}
          goal={`/ ${plan.calories} kcal`}
          progress={caloriesDone / plan.calories}
        />
        <StatCard
          icon={<Dumbbell size={18} />}
          label="Proteína"
          value={`${proteinDone}`}
          goal={`/ ${plan.protein} g`}
          progress={proteinDone / plan.protein}
        />
        <StatCard
          icon={<Droplets size={18} />}
          label="Agua"
          value={`${waterMl}`}
          goal={`/ ${plan.water} ml`}
          progress={waterMl / plan.water}
        />
        <StatCard
          icon={<Check size={18} />}
          label="Entreno"
          value={day.workoutDone ? "Hecho" : "Pendiente"}
          goal={`${profile.daysPerWeek} días/semana`}
          progress={day.workoutDone ? 1 : 0}
        />
      </section>

      <section className="mt-7 px-5">
        <h2 className="font-display text-lg font-semibold">Tu checklist de hoy</h2>
        <div className="mt-3 space-y-2.5">
          <CheckRow
            icon={<Dumbbell size={18} />}
            title="Entrenamiento del día"
            subtitle={day.workoutDone ? "¡Bien hecho!" : "Tren superior · 45 min"}
            checked={day.workoutDone}
            onToggle={() => update({ workoutDone: !day.workoutDone })}
          />
          {(Object.keys(day.meals) as (keyof DayLog["meals"])[]).map((meal) => (
            <CheckRow
              key={meal}
              icon={<UtensilsCrossed size={18} />}
              title={meal.charAt(0).toUpperCase() + meal.slice(1)}
              subtitle={`≈ ${Math.round(plan.calories / 4)} kcal · ${Math.round(plan.protein / 4)} g proteína`}
              checked={day.meals[meal]}
              onToggle={() => update({ meals: { ...day.meals, [meal]: !day.meals[meal] } })}
            />
          ))}
          <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-[0_10px_36px_-26px_rgba(0,0,0,0.6)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Droplets size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Agua</p>
              <p className="text-sm text-muted-foreground">
                {day.water} vasos · {waterMl} ml
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <RoundBtn
                label="Quitar un vaso de agua"
                onClick={() => update({ water: Math.max(0, day.water - 1) })}
              >
                <Minus size={16} />
              </RoundBtn>
              <RoundBtn label="Añadir un vaso de agua" onClick={() => update({ water: day.water + 1 })}>
                <Plus size={16} />
              </RoundBtn>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 px-5">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} />
            <p className="font-display text-sm font-semibold">Recomendación de hoy</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {recommendation(day, plan)}
          </p>
        </div>
      </section>

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

function recommendation(day: DayLog, plan: Plan) {
  const mealsDone = Object.values(day.meals).filter(Boolean).length;
  if (!day.workoutDone && mealsDone === 0)
    return "Empieza suave: un desayuno con proteína y tu sesión marcada. Un buen primer paso ya cambia el día.";
  if (day.water * 250 < plan.water * 0.5)
    return "Vas corto de agua. Bebe un par de vasos antes de tu próxima comida: mejora rendimiento y digestión.";
  if (!day.workoutDone)
    return "Nutrición encaminada. Ahora toca mover el hierro: 45 minutos bastan para estimular crecimiento.";
  if (mealsDone < 4)
    return `Entreno hecho. Te faltan ${4 - mealsDone} comidas para cubrir tus ${plan.protein} g de proteína; un batido con avena cierra el día.`;
  return "Día redondo: entreno completo, comidas cubiertas e hidratación al día. Duerme 7-9 h y deja que el músculo crezca.";
}

function StatCard({
  icon,
  label,
  value,
  goal,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  goal: string;
  progress: number;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="rounded-3xl bg-card p-4 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="font-display mt-2 text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{goal}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CheckRow({
  icon,
  title,
  subtitle,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={checked}
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-[0_10px_36px_-26px_rgba(0,0,0,0.6)] transition-colors"
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          checked ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-medium ${checked ? "text-muted-foreground line-through" : ""}`}
        >
          {title}
        </span>
        <span className="block text-sm text-muted-foreground">{subtitle}</span>
      </span>
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {checked ? <Check size={14} /> : null}
      </span>
    </button>
  );
}

function RoundBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
    >
      {children}
    </button>
  );
}
