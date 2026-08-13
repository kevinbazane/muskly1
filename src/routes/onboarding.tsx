import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Dumbbell, Flame, Target } from "lucide-react";
import { useProfile } from "@/hooks/useMuskly";
import { computePlan, type Goal, type Level, type Profile, type Sex } from "@/lib/muskly";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Empieza con Muskly | Tu plan para ganar músculo" },
      {
        name: "description",
        content:
          "Cuéntanos tu peso, talla, nivel y objetivo y calcularemos tu plan personalizado de hipertrofia.",
      },
      { property: "og:title", content: "Empieza con Muskly" },
      {
        property: "og:description",
        content: "Calcula tu plan personalizado para ganar masa muscular de forma saludable.",
      },
    ],
  }),
  component: Onboarding,
});

const goals: { id: Goal; label: string; desc: string }[] = [
  { id: "volumen", label: "Ganar volumen", desc: "Subir masa muscular con superávit" },
  { id: "fuerza", label: "Ganar fuerza", desc: "Más peso en la barra, cuerpo sólido" },
  { id: "definicion", label: "Definir", desc: "Mantener músculo, marcar más" },
];

const levels: { id: Level; label: string; desc: string }[] = [
  { id: "principiante", label: "Principiante", desc: "Menos de 6 meses entrenando" },
  { id: "intermedio", label: "Intermedio", desc: "Entre 6 meses y 2 años" },
  { id: "avanzado", label: "Avanzado", desc: "Más de 2 años constante" },
];

function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("hombre");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [level, setLevel] = useState<Level>("principiante");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [goal, setGoal] = useState<Goal>("volumen");
  const [targetWeight, setTargetWeight] = useState("");

  const totalSteps = 6;

  const draft: Profile = {
    name: name.trim() || "Atleta",
    age: Number(age) || 25,
    sex,
    weight: Number(weight) || 60,
    height: Number(height) || 170,
    level,
    daysPerWeek,
    goal,
    targetWeight: Number(targetWeight) || (Number(weight) || 60) + 5,
    createdAt: new Date().toISOString(),
  };

  const canContinue = (() => {
    if (step === 1) return name.trim().length > 1 && Number(age) >= 12 && Number(age) < 100;
    if (step === 2) return Number(weight) > 30 && Number(height) > 100;
    if (step === 4) return Number(targetWeight) > 30;
    return true;
  })();

  function next() {
    if (step === totalSteps - 1) {
      setProfile(draft);
      navigate({ to: "/" });
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background">
      <div className="flex items-center gap-3 px-5 pt-6">
        {step > 0 ? (
          <button
            aria-label="Atrás"
            onClick={() => setStep((s) => s - 1)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-foreground"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="h-9 w-9 shrink-0" />
        )}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-5 py-8">
        {step === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-[0_18px_40px_-18px_var(--primary)]">
              <Dumbbell size={36} />
            </div>
            <h1 className="font-display mt-6 text-3xl font-bold">Bienvenido a Muskly</h1>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Si te cuesta ganar peso, no estás roto: solo necesitas un plan hecho para ti. Vamos
              paso a paso, con calma y sin milagros.
            </p>
          </div>
        )}

        {step === 1 && (
          <Step title="¿Cómo te llamamos?" subtitle="Para saludarte cada mañana">
            <Field label="Nombre">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kevin"
                className="input-muskly"
              />
            </Field>
            <Field label="Edad">
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="24"
                className="input-muskly"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              {(["hombre", "mujer", "otro"] as Sex[]).map((s) => (
                <Chip key={s} active={sex === s} onClick={() => setSex(s)} label={s} />
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="Tu punto de partida" subtitle="Con esto calculamos tus calorías">
            <Field label="Peso actual (kg)">
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="58"
                className="input-muskly"
              />
            </Field>
            <Field label="Talla (cm)">
              <input
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="172"
                className="input-muskly"
              />
            </Field>
          </Step>
        )}

        {step === 3 && (
          <Step title="Tu experiencia" subtitle="Ajustamos el volumen de entrenamiento">
            <div className="space-y-3">
              {levels.map((l) => (
                <OptionCard
                  key={l.id}
                  active={level === l.id}
                  onClick={() => setLevel(l.id)}
                  title={l.label}
                  desc={l.desc}
                />
              ))}
            </div>
            <Field label={`Días disponibles por semana: ${daysPerWeek}`}>
              <input
                type="range"
                min={2}
                max={6}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </Field>
          </Step>
        )}

        {step === 4 && (
          <Step title="¿Cuál es tu objetivo?" subtitle="Podrás cambiarlo cuando quieras">
            <div className="space-y-3">
              {goals.map((g) => (
                <OptionCard
                  key={g.id}
                  active={goal === g.id}
                  onClick={() => setGoal(g.id)}
                  title={g.label}
                  desc={g.desc}
                />
              ))}
            </div>
            <Field label="Peso meta (kg)">
              <input
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="66"
                className="input-muskly"
              />
            </Field>
          </Step>
        )}

        {step === 5 && <Summary profile={draft} />}
      </main>

      <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          disabled={!canContinue}
          onClick={next}
          className="w-full rounded-2xl bg-primary py-4 font-display text-base font-semibold text-primary-foreground shadow-[0_16px_36px_-18px_var(--primary)] transition-opacity disabled:opacity-40"
        >
          {step === 0 ? "Empezar" : step === totalSteps - 1 ? "Ir a mi diario" : "Continuar"}
        </button>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border py-3 text-sm font-medium capitalize transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function OptionCard({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
        active ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
          active ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {active ? <Check size={14} /> : null}
      </span>
    </button>
  );
}

function Summary({ profile }: { profile: Profile }) {
  const plan = computePlan(profile);
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Listo, {profile.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Este es tu punto de partida diario. Lo ajustaremos según tu progreso.
        </p>
      </div>
      <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_20px_50px_-24px_var(--primary)]">
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Flame size={16} /> Calorías objetivo
        </div>
        <p className="font-display mt-1 text-4xl font-bold">{plan.calories} kcal</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Proteína", `${plan.protein} g`],
          ["Carbos", `${plan.carbs} g`],
          ["Grasas", `${plan.fats} g`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="font-display text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
        <Target size={20} className="shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Meta: llegar a <strong className="text-foreground">{profile.targetWeight} kg</strong>{" "}
          entrenando {profile.daysPerWeek} días por semana y bebiendo {plan.water} ml de agua al
          día.
        </p>
      </div>
    </div>
  );
}
