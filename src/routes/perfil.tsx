import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useProfile } from "@/hooks/useMuskly";
import { computePlan } from "@/lib/muskly";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil | Muskly" },
      {
        name: "description",
        content: "Tus datos, objetivo y preferencias de la app Muskly.",
      },
      { property: "og:title", content: "Perfil | Muskly" },
      {
        property: "og:description",
        content: "Tus datos, objetivo y preferencias de la app Muskly.",
      },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { profile, setProfile, loaded } = useProfile();
  const navigate = useNavigate();

  return (
    <AppShell>
      <ScreenHeader title="Perfil" subtitle="Tus datos y preferencias" />
      <div className="space-y-4 px-5">
        {loaded && profile ? (
          <>
            <div className="rounded-3xl bg-card p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-xl font-bold text-primary">
                  {profile.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-display truncate text-lg font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {profile.level} · objetivo {profile.goal}
                  </p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Edad", `${profile.age} años`],
                  ["Peso", `${profile.weight} kg`],
                  ["Talla", `${profile.height} cm`],
                  ["Meta", `${profile.targetWeight} kg`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-muted p-3">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-display text-base font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl bg-card p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.5)]">
              <p className="font-display text-base font-semibold">Tu plan diario</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {computePlan(profile).calories} kcal · {computePlan(profile).protein} g proteína ·{" "}
                {computePlan(profile).water} ml de agua
              </p>
            </div>

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
