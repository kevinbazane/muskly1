import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  HelpCircle,
  Music2,
  Repeat2,
  Settings,
  SkipBack,
  SkipForward,
  Video as VideoIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ROUTINES, type Place } from "@/lib/muskly-content";
import demoImg from "@/assets/exercise-demo.jpg";

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

  const complete = () => {
    setDone((d) => (d.includes(index) ? d : [...d, index]));
    if (index < workout.exercises.length - 1) {
      setRestLeft(parseRest(exercise.rest));
      setResting(true);
    } else void navigate({ to: "/ejercicios" });
  };

  const endRest = () => {
    setResting(false);
    go(index + 1);
  };


  const progress = ((index + (done.includes(index) ? 1 : 0)) / workout.exercises.length) * 100;

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
