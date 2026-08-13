import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Clock, Dumbbell, Home, Repeat, Timer } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useProfile } from "@/hooks/useMuskly";
import { ROUTINES, type Place } from "@/lib/muskly-content";

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
    ],
  }),
  component: EjerciciosPage,
});

function EjerciciosPage() {
  const { profile } = useProfile();
  const [place, setPlace] = useState<Place>("gimnasio");
  const [openDay, setOpenDay] = useState(0);

  const workouts = ROUTINES[place];
  const totalExercises = useMemo(
    () => workouts.reduce((sum, w) => sum + w.exercises.length, 0),
    [workouts],
  );

  return (
    <AppShell>
      <ScreenHeader
        title="Ejercicios"
        subtitle={
          profile
            ? `Plan ${profile.level} · ${profile.daysPerWeek} días por semana`
            : "Tu rutina semanal guiada"
        }
      />

      <div className="px-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          {(["gimnasio", "casa"] as Place[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPlace(p);
                setOpenDay(0);
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
      </div>

      <section className="mt-4 grid grid-cols-3 gap-3 px-5">
        <MiniStat label="Sesiones" value={`${workouts.length}`} />
        <MiniStat label="Ejercicios" value={`${totalExercises}`} />
        <MiniStat label="Descanso" value="48 h" />
      </section>

      <section className="mt-6 space-y-3 px-5">
        <h2 className="font-display text-lg font-semibold">Tu semana</h2>
        {workouts.map((w, i) => {
          const open = openDay === i;
          return (
            <article
              key={w.day}
              className="overflow-hidden rounded-3xl bg-card shadow-[0_12px_40px_-28px_rgba(0,0,0,0.6)]"
            >
              <button
                onClick={() => setOpenDay(open ? -1 : i)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Dumbbell size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold">{w.day}</span>
                  <span className="block truncate text-sm text-muted-foreground">{w.focus}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={13} />
                  {w.duration}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open ? (
                <div className="animate-fade-in space-y-2 border-t border-border px-4 pt-3 pb-4">
                  {w.exercises.map((ex) => (
                    <div key={ex.name} className="rounded-2xl bg-muted/60 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium">{ex.name}</p>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {ex.muscle}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Repeat size={12} /> {ex.sets} × {ex.reps}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer size={12} /> {ex.rest}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ex.cue}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-[0_12px_40px_-30px_rgba(0,0,0,0.6)]">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
