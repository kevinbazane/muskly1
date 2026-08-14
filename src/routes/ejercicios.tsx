import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Dumbbell, Flame, Heart, Home, LayoutList, MoreVertical, Play, Timer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/hooks/useMuskly";
import { ROUTINES, type Place } from "@/lib/muskly-content";
import heroImg from "@/assets/workout-hero.jpg";

export const Route = createFileRoute("/ejercicios")({
  head: () => ({
    meta: [
      { title: "Ejercicios | Muskly" },
      {
        name: "description",
        content: "Rutinas en casa o gimnasio con series, repeticiones y descansos guiados.",
      },
      { property: "og:title", content: "Ejercicios | Muskly" },
      {
        property: "og:description",
        content: "Rutinas en casa o gimnasio con series, repeticiones y descansos guiados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EjerciciosPage,
});

function EjerciciosPage() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place>("gimnasio");
  const [dayIndex, setDayIndex] = useState(0);
  const [fav, setFav] = useState(false);

  const workouts = ROUTINES[place];
  const workout = workouts[Math.min(dayIndex, workouts.length - 1)]!;

  const kcal = useMemo(() => workout.exercises.length * 55 + 60, [workout]);

  return (
    <AppShell>
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pt-8 pb-4">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-card text-primary shadow-[0_10px_30px_-22px_rgba(0,0,0,0.8)]">
          <Dumbbell size={18} />
        </span>
        <h1 className="text-center font-display text-lg font-bold">Entrenamiento</h1>
        <button
          onClick={() => setFav((f) => !f)}
          aria-label="Guardar rutina"
          className="grid h-10 w-10 place-items-center rounded-2xl bg-card text-muted-foreground shadow-[0_10px_30px_-22px_rgba(0,0,0,0.8)]"
        >
          <Heart size={18} className={fav ? "fill-primary text-primary" : ""} />
        </button>
      </header>

      {/* Hero */}
      <section className="px-5">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={heroImg}
            alt="Persona entrenando con mancuerna en el gimnasio"
            width={1024}
            height={576}
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-3 p-5">
            <h2 className="max-w-[62%] font-display text-2xl leading-tight font-bold text-background">
              {workout.focus.split("·")[0]?.trim()}
            </h2>
            <p className="text-sm text-background/80">
              {workout.exercises.length} ejercicios · {workout.duration}
            </p>
            <button className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_36px_-18px_var(--color-primary)] transition-transform active:scale-95">
              Empezar rutina
              <Play size={14} className="fill-current" />
            </button>
          </div>
        </div>
      </section>

      {/* Lugar */}
      <section className="mt-5 px-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          {(["gimnasio", "casa"] as Place[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPlace(p);
                setDayIndex(0);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium capitalize transition-colors ${
                place === p ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              {p === "casa" ? <Home size={16} /> : <Dumbbell size={16} />}
              {p}
            </button>
          ))}
        </div>

        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          {workouts.map((w, i) => (
            <button
              key={w.day}
              onClick={() => setDayIndex(i)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                i === dayIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-[0_10px_30px_-26px_rgba(0,0,0,0.8)]"
              }`}
            >
              {w.day}
            </button>
          ))}
        </div>
      </section>

      {/* Sobre la rutina */}
      <section className="mt-6 px-5">
        <h3 className="font-display text-lg font-semibold">Sobre esta rutina</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {workout.focus}. Trabajo enfocado con progresión de cargas para ganar masa muscular
          {profile ? ` a tu nivel ${profile.level}` : ""}.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-3xl bg-card p-4 shadow-[0_16px_44px_-32px_rgba(0,0,0,0.8)]">
          <Stat icon={<Timer size={16} />} value={workout.duration} label="Duración" />
          <Stat
            icon={<LayoutList size={16} />}
            value={`${workout.exercises.length}`}
            label="Ejercicios"
          />
          <Stat icon={<Flame size={16} />} value={`${kcal} kcal`} label="Gasto aprox." />
        </div>
      </section>

      {/* Ejercicios */}
      <section className="mt-6 px-5">
        <h3 className="font-display text-lg font-semibold">Ejercicios</h3>
        <div className="mt-3 space-y-2.5">
          {workout.exercises.map((ex, i) => (
            <Link
              key={ex.name}
              to="/entrenar"
              search={{ place, day: dayIndex, i }}
              className="flex items-center gap-3 rounded-3xl bg-card p-2.5 shadow-[0_16px_44px_-34px_rgba(0,0,0,0.8)] transition-transform active:scale-[0.99]"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Dumbbell size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{ex.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {ex.sets} series × {ex.reps} reps · {ex.muscle}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
                {ex.rest}
              </span>
              <Play size={16} className="shrink-0 fill-current text-primary" />
            </Link>
          ))}
        </div>

      </section>

      <section className="mt-6 px-5">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <p className="font-display text-sm font-semibold text-primary">Sube el peso, no el ego</p>
          <p className="mt-2 text-sm leading-relaxed">
            Cuando completes todas las series en el rango alto de repeticiones con buena técnica,
            añade 2,5 kg la próxima sesión. Esa progresión constante es lo que construye músculo.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="font-display text-sm font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
