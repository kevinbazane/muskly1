import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  Calendar,
  Check,
  Clock,
  Dumbbell,
  Flame,
  HelpCircle,
  Music2,
  Repeat2,
  Settings,
  Share2,
  SkipBack,
  SkipForward,
  Video as VideoIcon,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { ROUTINES, type Place } from "@/lib/muskly-content";
import { DAY_KEY_PREFIX, emptyDay, todayKey } from "@/lib/muskly";
import { saveSession } from "@/lib/muskly-history";
import demoImg from "@/assets/exercise-demo.jpg";
import completedAvatar from "@/assets/completed-avatar.jpg";

type Search = { place: Place; day: number; i: number };

export const Route = createFileRoute("/entrenar")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    place: search["place"] === "casa" ? "casa" : "gimnasio",
    day: Number(search["day"]) || 0,
    i: Number(search["i"]) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Ejercicio en curso | Muskly" },
      {
        name: "description",
        content:
          "Reproduce el video del ejercicio, sigue tus repeticiones y avanza serie a serie con Muskly.",
      },
      { property: "og:title", content: "Ejercicio en curso | Muskly" },
      {
        property: "og:description",
        content: "Video guiado, repeticiones y control de series para cada ejercicio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrenarPage,
});

function parseReps(reps: string) {
  const nums = reps.match(/\d+/g);
  if (!nums?.length) return 12;
  return Number(nums[nums.length - 1]);
}

function parseRest(rest: string) {
  const n = Number(rest.match(/\d+/)?.[0] ?? 60);
  return /min/i.test(rest) ? n * 60 : n;
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function useStreak() {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    try {
      const done: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(DAY_KEY_PREFIX)) continue;
        const raw = localStorage.getItem(key);
        if (raw && (JSON.parse(raw) as { workoutDone?: boolean }).workoutDone) {
          done.push(key.slice(DAY_KEY_PREFIX.length));
        }
      }
      done.sort();
      let count = 0;
      const cursor = new Date();
      for (;;) {
        const k = cursor.toISOString().slice(0, 10);
        if (done.includes(k)) {
          count++;
          cursor.setDate(cursor.getDate() - 1);
        } else if (count === 0 && k === new Date().toISOString().slice(0, 10)) {
          cursor.setDate(cursor.getDate() - 1);
        } else break;
      }
      setStreak(count);
    } catch {
      /* ignore */
    }
  }, []);
  return streak;
}

function EntrenarPage() {
  const { place, day, i } = Route.useSearch();
  const navigate = useNavigate();

  const workouts = ROUTINES[place];
  const workout = workouts[Math.min(day, workouts.length - 1)]!;
  const index = Math.min(Math.max(i, 0), workout.exercises.length - 1);
  const exercise = workout.exercises[index]!;

  const [mode, setMode] = useState<"reps" | "time">("reps");
  const [muted, setMuted] = useState(true);
  const [seconds, setSeconds] = useState(40);
  const [done, setDone] = useState<number[]>([]);
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(60);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [duration, setDuration] = useState(0);
  const streak = useStreak();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMode("reps");
    setSeconds(40);
  }, [index]);

  useEffect(() => {
    if (mode !== "time") return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [mode, index]);

  useEffect(() => {
    if (!resting) return;
    const id = setInterval(() => setRestLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resting]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), workout.exercises.length - 1);
      void navigate({ to: "/entrenar", search: { place, day, i: clamped } });
    },
    [navigate, place, day, workout.exercises.length],
  );

  const speak = () => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(`${exercise.name}. ${exercise.cue}`);
    u.lang = "es-ES";
    synth.speak(u);
  };

  const toggleSound = () => {
    setMuted((m) => {
      const next = !m;
      if (videoRef.current) videoRef.current.muted = next;
      if (!next) speak();
      else window.speechSynthesis?.cancel();
      return next;
    });
  };

  const saveWorkoutDone = () => {
    const key = DAY_KEY_PREFIX + todayKey();
    try {
      const raw = localStorage.getItem(key);
      const dayLog = raw ? { ...emptyDay(todayKey()), ...(JSON.parse(raw) as Record<string, unknown>) } : emptyDay(todayKey());
      localStorage.setItem(key, JSON.stringify({ ...dayLog, workoutDone: true }));
    } catch {
      /* ignore */
    }
  };

  const complete = () => {
    setDone((d) => (d.includes(index) ? d : [...d, index]));
    if (index < workout.exercises.length - 1) {
      setRestLeft(parseRest(exercise.rest));
      setResting(true);
    } else {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      setDuration(secs);
      saveWorkoutDone();
      saveSession({
        title: `${workout.day} · ${workout.focus}`,
        exercises: workout.exercises.length,
        seconds: secs,
        kcal: Math.round((secs / 60) * 8.5),
      });
      setCompleted(true);
    }
  };

  const endRest = () => {
    setResting(false);
    go(index + 1);
  };

  useEffect(() => {
    if (resting && restLeft === 0) endRest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resting, restLeft]);

  const progress = ((index + (done.includes(index) ? 1 : 0)) / workout.exercises.length) * 100;

  const nextExercise = workout.exercises[Math.min(index + 1, workout.exercises.length - 1)]!;

  if (completed) {
    const calories = Math.round((duration / 60) * 8.5);
    const xp = Math.min(150 + workout.exercises.length * 25, 600);
    const newStreak = streak + (streak === 0 ? 1 : 0);
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background">
        <header className="flex items-center justify-between px-5 pt-6">
          <button
            onClick={() => navigate({ to: "/ejercicios" })}
            aria-label="Cerrar"
            className="grid h-11 w-11 place-items-center rounded-full bg-muted text-foreground"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center px-6 pt-4 pb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">¡Gran trabajo!</h1>

          <div className="relative mt-8">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-primary/20 shadow-xl">
              <img
                src={completedAvatar}
                alt="Entrenamiento completado"
                className="h-full w-full object-cover"
                width={144}
                height={144}
              />
            </div>
            <div className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Award size={20} />
            </div>
          </div>

          <h2 className="mt-6 font-display text-2xl font-bold text-foreground">Entrenamiento completado</h2>

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            <StatCard icon={Flame} value={String(calories)} label="Calorías totales" color="text-orange-500" />
            <StatCard icon={Clock} value={formatDuration(duration)} label="Duración total" color="text-primary" />
            <StatCard icon={Dumbbell} value={String(workout.exercises.length)} label="Ejercicios" color="text-purple-500" />
          </div>

          <div className="mt-6 w-full rounded-3xl bg-card p-5 text-left shadow-[0_10px_40px_-24px_rgba(0,0,0,0.5)]">
            <h3 className="font-display text-base font-bold text-foreground">Recompensas y progreso</h3>

            <div className="mt-4 rounded-2xl bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ganado</p>
                    <p className="font-display text-lg font-bold text-primary">+{xp} XP</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-foreground">Nivel 1</p>
                  <p className="text-xs text-muted-foreground">{xp} al siguiente</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary" style={{ width: "35%" }} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-orange-50 p-4 text-left dark:bg-orange-500/10">
                <div className="flex items-center gap-2 text-orange-500">
                  <Calendar size={18} />
                  <span className="font-display text-lg font-bold">{newStreak || streak || 1}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Racha de días</p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-4 text-left dark:bg-purple-500/10">
                <div className="flex items-center gap-2 text-purple-500">
                  <Award size={18} />
                  <span className="font-display text-sm font-bold">Nuevo</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Insignia desbloqueada</p>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full space-y-3 pt-6">
            <button
              onClick={() => navigate({ to: "/ejercicios" })}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display font-bold text-primary-foreground shadow-[0_18px_40px_-18px_var(--color-primary)] transition-transform active:scale-95"
            >
              Listo <Check size={20} strokeWidth={3} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  void navigator.share({
                    title: "Entrenamiento completado con Muskly",
                    text: `Hoy completé ${workout.exercises.length} ejercicios en ${formatDuration(duration)}. ¡Vamos por más!`,
                  });
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-4 font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Share2 size={18} /> Compartir logro
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resting) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-primary text-primary-foreground">
        <div className="overflow-hidden rounded-b-[32px] bg-card">
          <img
            src={demoImg}
            alt={`Demostración de ${nextExercise.name}`}
            className="h-[38vh] max-h-[360px] w-full object-cover"
          />
        </div>

        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div className="min-w-0">
            <p className="font-display text-sm font-bold tracking-wide uppercase">
              Siguiente {index + 2}/{workout.exercises.length}
            </p>
            <h1 className="mt-1 font-display text-xl leading-snug font-bold">
              {nextExercise.name}
            </h1>
          </div>
          <span className="shrink-0 font-display text-xl font-bold">
            ×{parseReps(nextExercise.reps)}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="font-display text-2xl font-bold tracking-wide uppercase">Descanso</p>
          <p className="font-display text-6xl font-extrabold tabular-nums">
            {String(Math.floor(restLeft / 60)).padStart(2, "0")}:
            {String(restLeft % 60).padStart(2, "0")}
          </p>
          <button
            onClick={() => setRestLeft((s) => Math.max(s - 10, 0))}
            className="rounded-full bg-primary-foreground/15 px-6 py-3 text-sm font-semibold"
          >
            Reducir 10 s
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 pb-10">
          <button
            onClick={() => setRestLeft((s) => s + 20)}
            className="rounded-full bg-primary-foreground/15 py-4 font-display text-base font-bold transition-transform active:scale-95"
          >
            +20 s
          </button>
          <button
            onClick={endRest}
            className="rounded-full bg-card py-4 font-display text-base font-bold text-primary transition-transform active:scale-95"
          >
            OMITIR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background">
      {/* Media */}
      <div className="relative bg-muted">
        <video
          ref={videoRef}
          poster={demoImg}
          muted
          autoPlay
          loop
          playsInline
          className="h-[46vh] max-h-[440px] w-full bg-muted object-contain"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate({ to: "/ejercicios" })}
            aria-label="Volver"
            className="grid h-11 w-11 place-items-center rounded-full bg-foreground/10 text-foreground backdrop-blur"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <RoundBtn label="Ver video" onClick={() => videoRef.current?.play()}>
              <VideoIcon size={18} />
            </RoundBtn>
            <RoundBtn label={muted ? "Activar audio" : "Silenciar"} onClick={toggleSound}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </RoundBtn>
            <RoundBtn label="Música" onClick={speak}>
              <Music2 size={18} />
            </RoundBtn>
            <RoundBtn label="Ajustes" onClick={() => setMode(mode === "reps" ? "time" : "reps")}>
              <Settings size={18} />
            </RoundBtn>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-border">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Detalle */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="font-display text-2xl font-bold">{exercise.name}</h1>
          <button
            aria-label="Cómo hacerlo"
            onClick={speak}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <HelpCircle size={22} />
          </button>
        </div>

        <p className="font-display text-6xl font-extrabold tracking-tight">
          {mode === "reps" ? (
            <>
              <span className="text-muted-foreground">×</span>
              {parseReps(exercise.reps)}
            </>
          ) : (
            `00:${String(seconds).padStart(2, "0")}`
          )}
        </p>

        <button
          onClick={() => setMode(mode === "reps" ? "time" : "reps")}
          className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground"
        >
          {mode === "reps" ? "Reps" : "Tiempo"}
          <Repeat2 size={16} />
        </button>

        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          {exercise.sets} series · descanso {exercise.rest} · {exercise.muscle}
        </p>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-[64px_1fr_64px] items-center gap-3 px-6 pb-10">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Anterior"
          className="grid h-16 place-items-center rounded-2xl bg-muted text-foreground disabled:opacity-40"
        >
          <SkipBack size={22} className="fill-current" />
        </button>
        <button
          onClick={complete}
          aria-label="Completar ejercicio"
          className="grid h-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_40px_-18px_var(--color-primary)] transition-transform active:scale-95"
        >
          <Check size={28} strokeWidth={3} />
        </button>
        <button
          onClick={() => go(index + 1)}
          disabled={index === workout.exercises.length - 1}
          aria-label="Siguiente"
          className="grid h-16 place-items-center rounded-2xl bg-muted text-foreground disabled:opacity-40"
        >
          <SkipForward size={22} className="fill-current" />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
      <Icon size={22} className={`mx-auto ${color}`} />
      <p className={`font-display mt-2 text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function RoundBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-foreground/10 text-foreground backdrop-blur transition-colors hover:bg-foreground/20"
    >
      {children}
    </button>
  );
}
