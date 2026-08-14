import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Settings,
  Crown,
  UserRound,
  BarChart2,
  Target,
  CalendarClock,
  HelpCircle,
  ChevronRight,
  Flame,
  Dumbbell,
  Star,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/hooks/useMuskly";
import { computePlan, DAY_KEY_PREFIX, type DayLog } from "@/lib/muskly";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil | Muskly" },
      {
        name: "description",
        content: "Tu perfil Muskly: estadísticas de entrenamiento, logros y ajustes de tu plan.",
      },
      { property: "og:title", content: "Perfil | Muskly" },
      {
        property: "og:description",
        content: "Tu perfil Muskly: estadísticas de entrenamiento, logros y ajustes de tu plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerfilPage,
});

function useTrainingStats() {
  const [stats, setStats] = useState({ workouts: 0, minutes: 0, streak: 0 });

  useEffect(() => {
    try {
      const days: DayLog[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(DAY_KEY_PREFIX)) continue;
        const raw = localStorage.getItem(key);
        if (raw) days.push(JSON.parse(raw) as DayLog);
      }
      const done = days.filter((d) => d.workoutDone).map((d) => d.date).sort();
      let streak = 0;
      const cursor = new Date();
      for (;;) {
        const k = cursor.toISOString().slice(0, 10);
        if (done.includes(k)) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else if (streak === 0 && k === new Date().toISOString().slice(0, 10)) {
          cursor.setDate(cursor.getDate() - 1);
        } else break;
      }
      setStats({ workouts: done.length, minutes: done.length * 45, streak });
    } catch {
      /* ignore */
    }
  }, []);

  return stats;
}

const menuItems = [
  { icon: UserRound, label: "Información personal", to: "/onboarding" as const },
  { icon: BarChart2, label: "Medidas corporales", to: "/informe" as const },
  { icon: Target, label: "Objetivos", to: "/onboarding" as const },
  { icon: CalendarClock, label: "Historial de actividad", to: "/informe" as const },
  { icon: Settings, label: "Ajustes", to: "/perfil" as const },
  { icon: HelpCircle, label: "Ayuda y soporte", to: "/perfil" as const },
];

function PerfilPage() {
  const { profile, setProfile, loaded } = useProfile();
  const navigate = useNavigate();
  const stats = useTrainingStats();

  const achievements = [
    {
      label: `${stats.streak || 0} días\nde racha`,
      node: <span className="font-display text-2xl font-bold">{stats.streak}</span>,
      active: stats.streak > 0,
    },
    {
      label: "Maestro\nde calorías",
      node: <Flame size={26} />,
      active: stats.workouts >= 3,
    },
    {
      label: "Guerrero\ndel gym",
      node: <Dumbbell size={26} />,
      active: stats.workouts >= 10,
    },
    {
      label: "Meta\nconquistada",
      node: <Star size={26} />,
      active: !!profile && profile.weight >= profile.targetWeight,
    },
  ];

  const plan = profile ? computePlan(profile) : null;

  return (
    <AppShell>
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Perfil</h1>
        <button
          aria-label="Ajustes"
          className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <Settings size={22} />
        </button>
      </header>

      <div className="space-y-4 px-5">
        {loaded && profile ? (
          <>
            <section className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_18px_45px_-22px_var(--color-primary)]">
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-primary-foreground/70 bg-primary-foreground/15 font-display text-3xl font-bold">
                  {profile.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-display truncate text-xl font-bold">{profile.name}</p>
                  <p className="truncate text-sm text-primary-foreground/80 capitalize">
                    {profile.level} · {profile.daysPerWeek} días/semana
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium">
                    <Crown size={14} /> Plan {profile.goal}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-primary-foreground/25 text-center">
                {[
                  ["Entrenos", String(stats.workouts)],
                  ["Horas", `${Math.floor(stats.minutes / 60)}h ${stats.minutes % 60}m`],
                  ["Racha", `${stats.streak} días`],
                ].map(([k, v]) => (
                  <div key={k} className="px-1">
                    <p className="text-xs text-primary-foreground/80">{k}</p>
                    <p className="font-display mt-1 text-lg font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-card p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">Logros</h2>
                <span className="text-sm font-medium text-primary">Ver todos</span>
              </div>
              <ul className="mt-4 grid grid-cols-4 gap-2">
                {achievements.map((a, i) => (
                  <li key={i} className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-2xl ${
                        a.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {a.node}
                    </div>
                    <span className="text-[11px] leading-tight whitespace-pre-line text-muted-foreground">
                      {a.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {plan ? (
              <section className="rounded-3xl bg-card p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.5)]">
                <p className="font-display text-base font-semibold">Tu plan diario</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.calories} kcal · {plan.protein} g proteína · {plan.water} ml de agua
                </p>
              </section>
            ) : null}

            <section className="overflow-hidden rounded-3xl bg-card shadow-[0_10px_40px_-24px_rgba(0,0,0,0.5)]">
              <ul className="divide-y divide-border">
                {menuItems.map(({ icon: Icon, label, to }) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate({ to })}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                        <Icon size={18} />
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <button
              onClick={() => {
                setProfile(null);
                navigate({ to: "/onboarding" });
              }}
              className="w-full rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Rehacer mi cuestionario
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Cargando tus datos…</p>
        )}
      </div>
    </AppShell>
  );
}
