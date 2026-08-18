import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Apple,
  ArrowLeft,
  Bell,
  Check,
  ChevronLeft,
  Droplets,
  Dumbbell,
  Mars,
  Transgender,
  Venus,
  Wheat,
  X,
  Zap,
} from "lucide-react";
import { useProfile } from "@/hooks/useMuskly";
import {
  computePlan,
  type ActivityLevel,
  type Goal,
  type Level,
  type Plan,
  type Profile,
  type Sex,
} from "@/lib/muskly";
import nutritionHero from "@/assets/nutrition-onboarding.jpg";
import goalLookBetter from "@/assets/goal-look-better.jpg";
import goalStrength from "@/assets/goal-strength.jpg";
import goalConfidence from "@/assets/goal-confidence.jpg";


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

const sexOptions: { id: Sex; label: string; icon: typeof Mars }[] = [
  { id: "hombre", label: "Hombre", icon: Mars },
  { id: "mujer", label: "Mujer", icon: Venus },
  { id: "otro", label: "Prefiero no decir", icon: Transgender },
];

const goalCards: { id: Goal; label: string; image: string }[] = [
  { id: "definicion", label: "Verse mejor en atuendos", image: goalLookBetter },
  { id: "fuerza", label: "Construir fuerza", image: goalStrength },
  { id: "volumen", label: "Aumentar la confianza y la energía", image: goalConfidence },
];



const levels: { id: Level; label: string; desc: string }[] = [
  { id: "principiante", label: "Principiante", desc: "Menos de 6 meses entrenando" },
  { id: "intermedio", label: "Intermedio", desc: "Entre 6 meses y 2 años" },
  { id: "avanzado", label: "Avanzado", desc: "Más de 2 años constante" },
];

const activityLevels: { id: ActivityLevel; label: string; emoji: string }[] = [
  { id: "sedentario", label: "Sedentario", emoji: "\u{1F468}\u200D\u{1F4BB}" },
  { id: "ligera", label: "Actividad ligera", emoji: "\u{1F6B6}" },
  { id: "moderada", label: "Moderadamente activa", emoji: "\u{1F3C3}" },
  { id: "muy_activa", label: "Muy activa", emoji: "\u{1F970}" },
];

const pushupOptions: { id: string; label: string; desc: string; emoji: string }[] = [
  { id: "principiante", label: "Principiante", desc: "3-5 flexiones", emoji: "\u261D\uFE0F" },
  { id: "intermedio", label: "Intermedio", desc: "5-10 flexiones", emoji: "\u270C\uFE0F" },
  { id: "avanzado", label: "Avanzado", desc: "Al menos 10", emoji: "\u{1F44D}" },
];

const dayOrder = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const weekDays = [
  { key: "dom", label: "dom" },
  { key: "lun", label: "lun" },
  { key: "mar", label: "mar" },
  { key: "mié", label: "mié" },
  { key: "jue", label: "jue" },
  { key: "vie", label: "vie" },
  { key: "sáb", label: "sáb" },
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("hombre");
  const [weight, setWeight] = useState("63");
  const [height, setHeight] = useState("168");
  const [level, setLevel] = useState<Level>("principiante");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [selectedDays, setSelectedDays] = useState<string[]>(["lun", "mar", "jue", "vie"]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [activity, setActivity] = useState<ActivityLevel>("ligera");
  const [pushups, setPushups] = useState<string | null>(null);
  const [goal, setGoal] = useState<Goal>("volumen");
  const [targetWeight, setTargetWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");


  const totalSteps = 12;

  const draft: Profile = {
    name: name.trim() || "Atleta",
    age: Number(age) || 25,
    sex,
    weight: Number(weight) || 60,
    height: Number(height) || 170,
    level,
    daysPerWeek,
    activity,
    goal,
    targetWeight: Number(targetWeight) || (Number(weight) || 60) + 5,
    createdAt: new Date().toISOString(),
  };

  const canContinue = (() => {
    if (step === 2) return Number(age) >= 12 && Number(age) < 100;
    if (step === 3) return Number(weight) > 30 && Number(height) > 100;
    if (step === 5) return name.trim().length > 1;
    if (step === 8) return pushups !== null;
    if (step === 9) return selectedDays.length > 0;
    if (step === 10) return Number(targetWeight) > 30;
    return true;
  })();

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    );
  }

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
      <div className="px-5 pt-6">
        <div className="grid grid-cols-[36px_minmax(0,1fr)_36px] items-center">
          {step > 0 ? (
            <button
              aria-label="Atrás"
              onClick={() => setStep((s) => s - 1)}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground"
            >
              <ChevronLeft size={26} />
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center justify-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Zap size={18} fill="currentColor" />
            </span>
            <span className="font-display text-xl font-extrabold italic tracking-tight text-foreground">
              Muskly
            </span>
          </div>
          {step === 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="text-xs font-semibold tracking-wide text-muted-foreground"
            >
              OMITIR
            </button>
          ) : (
            <span />
          )}
        </div>

        <StepProgress step={step} totalSteps={totalSteps} />
      </div>

      <main className="flex-1 px-5 py-6">
        {step === 0 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-center text-[32px] font-extrabold leading-tight">
              Comencemos con lo básico
            </h1>
            <p className="mx-auto mt-3 max-w-[300px] text-center text-base text-muted-foreground">
              Adaptaremos tu plan según tu género para obtener mejores resultados.
            </p>

            <div className="mt-8 space-y-4">
              {sexOptions.map((option) => {
                const Icon = option.icon;
                const active = sex === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSex(option.id);
                      setStep(1);
                    }}
                    className={`flex w-full items-center gap-5 rounded-3xl px-6 py-7 text-left transition-colors ${
                      active ? "bg-primary/10 ring-2 ring-primary" : "bg-muted"
                    }`}
                  >
                    <Icon size={30} className="shrink-0 text-foreground" strokeWidth={2.2} />
                    <span className="font-display text-xl font-bold text-foreground">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-center text-[28px] font-extrabold leading-tight">
              ¿Cuál es tu objetivo principal para ganar músculo?
            </h1>

            <div className="mt-8 space-y-4">
              {goalCards.map((g) => {
                const active = goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`relative flex h-[132px] w-full items-center overflow-hidden rounded-3xl text-left transition-colors ${
                      active ? "bg-primary/10 ring-2 ring-primary" : "bg-muted"
                    }`}
                  >
                    <span className="relative z-10 max-w-[58%] pl-6 font-display text-xl font-bold leading-snug text-foreground">
                      {g.label}
                    </span>
                    <img
                      src={g.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      width={768}
                      height={768}
                      className="absolute right-0 top-0 h-full w-[46%] object-cover object-top [mask-image:linear-gradient(to_right,transparent,black_28%)]"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}




        {step === 2 && (
          <div className="animate-fade-in flex flex-col">
            <h1 className="font-display text-center text-[32px] font-extrabold leading-tight">
              Tu edad
            </h1>
            <p className="mx-auto mt-3 max-w-[300px] text-center text-base text-muted-foreground">
              La información sobre la edad nos ayuda a evaluar de manera más precisa tu nivel
              metabólico
            </p>

            <AgeWheel
              value={Number(age) || 30}
              onChange={(n) => setAge(String(n))}
            />
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-8 pt-4">
            <div className="text-center">
              <h1 className="font-display text-[28px] font-bold leading-tight">
                Cuéntanos más sobre ti
              </h1>
              <p className="mx-auto mt-2 max-w-[280px] text-sm text-muted-foreground">
                Déjanos conocerte mejor para potenciar los resultados de tu entrenamiento
              </p>
            </div>

            <RulerSelector
              label="Peso"
              value={Number(weight) || 0}
              onChange={(kg) => setWeight(String(Math.round(kg)))}
              unit={weightUnit}
              onUnitChange={(u) => setWeightUnit(u as "kg" | "lbs")}
              options={[
                { key: "kg", label: "kg" },
                { key: "lbs", label: "lbs" },
              ]}
            />

            <RulerSelector
              label="Altura"
              value={Number(height) || 0}
              onChange={(cm) => setHeight(String(Math.round(cm)))}
              unit={heightUnit}
              onUnitChange={(u) => setHeightUnit(u as "cm" | "ft")}
              options={[
                { key: "cm", label: "cm" },
                { key: "ft", label: "ft" },
              ]}
            />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col">
            <h1 className="font-display text-3xl font-bold leading-tight">
              Construye tus músculos{" "}
              <span className="text-primary">más rápido, seguro y efectivo!</span>
            </h1>

            <div className="mt-8 grid grid-cols-2 items-end gap-3">
              <div className="rounded-3xl bg-muted p-5">
                <p className="font-display text-center text-base font-semibold text-muted-foreground">
                  Otros planes
                </p>
                <ul className="mt-4 space-y-3">
                  {["Sin resultados", "Talla única para todos", "Fácil de recaer", "Difícil de hacer"].map(
                    (t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X size={16} className="mt-0.5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="rounded-3xl bg-primary p-5 shadow-[0_20px_40px_-20px_var(--primary)]">
                <p className="font-display text-center text-lg font-bold text-primary-foreground">
                  Nuestro Plan
                </p>
                <ul className="mt-4 space-y-3">
                  {["Cambios visibles", "Personalizado", "Sostenible", "Fácil de seguir"].map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-sm font-medium text-primary-foreground"
                    >
                      <Check size={16} className="mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Un plan hecho a tu medida, con progresión real y sin atajos.
            </p>
          </div>
        )}

        {step === 5 && (
          <Step title="¿Cómo te llamamos?" subtitle="Para saludarte cada mañana">
            <Field label="Nombre">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kevin"
                className="input-muskly"
              />
            </Field>
          </Step>
        )}



        {step === 6 && (
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
          </Step>
        )}

        {step === 7 && (
          <Step
            title="¿Cuál es tu nivel de actividad?"
            subtitle="Así ajustamos tus calorías diarias con más precisión"
          >
            <div className="space-y-3">
              {activityLevels.map((a) => {
                const active = activity === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setActivity(a.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-5 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <span aria-hidden className="text-2xl">
                      {a.emoji}
                    </span>
                    <span
                      className={`font-display text-base font-semibold ${
                        active ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {a.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 8 && (
          <Step
            title="¿Cuántas flexiones puedes hacer seguidas?"
            subtitle="Nos ayuda a calibrar tu primera rutina"
          >
            <div className="space-y-4">
              {pushupOptions.map((p) => {
                const active = pushups === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPushups(p.id)}
                    className={`flex w-full items-center gap-5 rounded-2xl border-2 px-5 py-5 text-left transition-all ${
                      active ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <span aria-hidden className="text-3xl">
                      {p.emoji}
                    </span>
                    <span className="flex flex-col">
                      <span
                        className={`font-display text-lg font-bold ${
                          active ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {p.label}
                      </span>
                      <span className="text-sm text-muted-foreground">{p.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 9 && (
          <Step
            title="¡Elige los días de entrenamiento!"
            subtitle={`¡Genial! Según tus datos, te recomendamos ${daysPerWeek} entrenamientos por semana.`}
          >
            <div className="mx-auto grid max-w-[340px] grid-cols-4 gap-3">
              {weekDays.map((d) => {
                const active = selectedDays.includes(d.key);
                const isToday = d.key === todayKey();
                return (
                  <button
                    key={d.key}
                    onClick={() => toggleDay(d.key)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 text-sm font-semibold transition-all ${
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {active && (
                      <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check size={14} />
                      </span>
                    )}
                    <span className="font-display text-lg capitalize">{d.label}</span>
                    {isToday && (
                      <span className="absolute bottom-2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Hoy
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-display font-semibold">Alertas</p>
                  <p className="max-w-[200px] text-xs text-muted-foreground">
                    ¡Crea un hábito y no te pierdas nunca tu día de entrenamiento!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAlertsEnabled((v) => !v)}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  alertsEnabled ? "bg-primary" : "bg-muted"
                }`}
                aria-label={alertsEnabled ? "Desactivar alertas" : "Activar alertas"}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
                    alertsEnabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </Step>
        )}

        {step === 10 && (
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
                onChange={(e) => setTargetWeight(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="66"
                className="input-muskly"
              />
            </Field>
          </Step>
        )}

        {step === 11 && <NutritionInfoStep plan={computePlan(draft)} />}
      </main>

      <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {step === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <span className="font-semibold text-primary underline underline-offset-4">
              Iniciar sesión
            </span>
          </p>
        ) : (
          <button
            disabled={!canContinue}
            onClick={next}
            className="w-full rounded-2xl bg-primary py-4 font-display text-base font-semibold text-primary-foreground shadow-[0_16px_36px_-18px_var(--primary)] transition-opacity disabled:opacity-40"
          >
            {step === totalSteps - 1 ? "Ir a mi diario" : "Continuar"}
          </button>
        )}
      </div>
    </div>
  );
}

function StepProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  const segments = 5;
  const progress = (step + 1) / totalSteps;
  return (
    <div className="mt-5 flex items-center">
      {Array.from({ length: segments }).map((_, i) => {
        const start = i / segments;
        const fill = Math.min(Math.max((progress - start) * segments, 0), 1);
        return (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${fill * 100}%` }}
              />
            </div>
            <span
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                progress >= (i + 1) / segments ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        );
      })}
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

function NutritionInfoStep({ plan }: { plan?: Plan }) {
  const protein = plan?.protein ?? 24;
  const carbs = plan?.carbs ?? 48;
  const calories = plan?.calories ?? 520;
  return (
    <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-full space-y-6">
        <h1 className="font-display text-[28px] font-bold leading-tight">
          Toma decisiones más inteligentes con{" "}
          <span className="text-primary">orientación profesional</span>
        </h1>
        <div className="relative mx-auto aspect-square w-full max-w-[320px]">
          <div className="absolute inset-0 rounded-[40px] bg-[#f0f7f0] p-3">
            <img
              src={nutritionHero}
              alt="Plato saludable para ganar masa muscular"
              className="h-full w-full rounded-[32px] object-cover"
              width={1024}
              height={1024}
            />
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-0 rounded-2xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-1.5 border-r border-border px-3 first:pl-0 last:border-0 last:pr-0">
                <Wheat size={18} className="text-primary" />
                <span className="text-sm font-bold text-foreground">{protein} g</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3 last:border-0 last:pr-0">
                <Apple size={18} className="text-green-600" />
                <span className="text-sm font-bold text-foreground">{carbs} g</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 last:pr-0">
                <Droplets size={18} className="text-blue-500" />
                <span className="text-sm font-bold text-foreground">{calories} kcal</span>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-1 -left-1 h-8 w-8 rounded-full border-t-4 border-l-4 border-white" />
          <div className="pointer-events-none absolute -top-1 -right-1 h-8 w-8 rounded-full border-t-4 border-r-4 border-white" />
          <div className="pointer-events-none absolute -bottom-1 -left-1 h-8 w-8 rounded-full border-b-4 border-l-4 border-white" />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-b-4 border-r-4 border-white" />
        </div>
        <p className="mx-auto max-w-[280px] text-sm text-muted-foreground">
          Recibe comentarios instantáneos sobre lo que comes, recetas saludables según tu
          objetivo y consejos diarios para tomar mejores decisiones.
        </p>
      </div>
    </div>
  );
}

function todayKey() {
  const idx = new Date().getDay();
  return dayOrder[idx];
}

const KG_TO_LBS = 2.20462;
const CM_TO_FT = 0.0328084;

const unitConfig: Record<
  string,
  { min: number; max: number; step: number; decimals: number; labelInterval: number; tickWidth: number }
> = {
  kg: { min: 30, max: 150, step: 1, decimals: 0, labelInterval: 1, tickWidth: 24 },
  lbs: { min: 66, max: 331, step: 1, decimals: 0, labelInterval: 5, tickWidth: 12 },
  cm: { min: 100, max: 250, step: 1, decimals: 0, labelInterval: 10, tickWidth: 14 },
  ft: { min: 3.28, max: 8.2, step: 0.02, decimals: 2, labelInterval: 0.5, tickWidth: 16 },
};



function fromBase(value: number, unit: string) {
  if (unit === "lbs") return value * KG_TO_LBS;
  if (unit === "ft") return value * CM_TO_FT;
  return value;
}

function toBase(value: number, unit: string) {
  if (unit === "lbs") return value / KG_TO_LBS;
  if (unit === "ft") return value / CM_TO_FT;
  return value;
}

function RulerSelector({
  label,
  value,
  onChange,
  unit,
  onUnitChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (baseValue: number) => void;
  unit: string;
  onUnitChange: (unit: string) => void;
  options: { key: string; label: string }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const config = unitConfig[unit]!;

  const values = useMemo(() => {
    const arr: number[] = [];
    for (let v = config.min; v <= config.max + 1e-9; v += config.step) {
      arr.push(Number(v.toFixed(config.decimals)));
    }
    return arr;
  }, [config]);

  const [displayValue, setDisplayValue] = useState(() => {
    const display = fromBase(value, unit);
    return Math.max(config.min, Math.min(config.max, display));
  });

  useEffect(() => {
    const display = fromBase(value, unit);
    const clamped = Math.max(config.min, Math.min(config.max, display));
    const rounded = Number(clamped.toFixed(config.decimals));
    if (rounded !== displayValue) {
      setDisplayValue(rounded);
    }
  }, [value, unit]);

  const scrollToValue = (target: number) => {
    if (!containerRef.current) return;
    const index = Math.round((target - config.min) / config.step);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    const scrollLeft = clampedIndex * config.tickWidth - containerWidth / 2 + config.tickWidth / 2;
    isProgrammaticScroll.current = true;
    containerRef.current.scrollTo({ left: scrollLeft, behavior: "auto" });
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 50);
  };

  useEffect(() => {
    scrollToValue(displayValue);
  }, [displayValue, unit, containerWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateWidth = () => setContainerWidth(container.clientWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleScroll = () => {
    if (isProgrammaticScroll.current || !containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const index = Math.round((scrollLeft + containerWidth / 2 - config.tickWidth / 2) / config.tickWidth);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    const newDisplayValue = values[clampedIndex] ?? config.min;
    if (newDisplayValue !== displayValue) {
      setDisplayValue(newDisplayValue);
      onChange(toBase(newDisplayValue, unit));
    }
  };


  const isMajor = (v: number) => {
    const remainder = v % config.labelInterval;
    return Math.abs(remainder) < 1e-9 || Math.abs(remainder - config.labelInterval) < 1e-9;
  };


  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold">{label}</h3>
        <div className="flex rounded-full bg-muted p-1">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onUnitChange(opt.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                unit === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4">
        <div className="text-center">
          <span className="font-display text-6xl font-bold text-primary">
            {displayValue.toFixed(config.decimals)}
          </span>
          <span className="ml-1 text-lg font-medium text-muted-foreground">{unit}</span>
        </div>

        <div className="relative mt-6 h-28">
          <div className="pointer-events-none absolute top-0 left-1/2 z-10 h-14 w-0.5 -translate-x-1/2 rounded-full bg-primary" />
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="scrollbar-hide flex h-full overflow-x-auto"
            style={{ scrollBehavior: "auto" }}
          >
            <div style={{ width: containerWidth / 2, flexShrink: 0 }} />
            {values.map((v, i) => (
              <div
                key={i}
                className="flex shrink-0 flex-col items-center justify-start"
                style={{ width: config.tickWidth }}
              >

                <div
                  className={`w-0.5 rounded-full ${
                    isMajor(v) ? "h-8 bg-foreground" : "h-4 bg-muted-foreground/40"
                  }`}
                />
                {isMajor(v) && (
                  <span className="mt-1.5 text-[10px] font-medium text-muted-foreground">
                    {Number(v.toFixed(config.decimals))}
                  </span>
                )}

              </div>
            ))}
            <div style={{ width: containerWidth / 2, flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
}


function AgeWheel({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM = 76;
  const ages = Array.from({ length: 89 }, (_, i) => i + 12);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = (value - 12) * ITEM;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mt-10">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[76px] -translate-y-1/2 rounded-3xl bg-muted" />
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.min(Math.max(Math.round(el.scrollTop / ITEM), 0), ages.length - 1);
          const next = ages[idx] ?? value;
          if (next !== value) onChange(next);
        }}
        className="relative h-[380px] snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingTop: 152 }}
      >
        <div style={{ height: 152 }} />
        {ages.map((a) => {
          const active = a === value;
          return (
            <div
              key={a}
              onClick={() => onChange(a)}
              className="flex snap-center items-center justify-center gap-3"
              style={{ height: ITEM }}
            >
              <span
                className={`font-display tabular-nums transition-all ${
                  active
                    ? "text-[44px] font-extrabold text-foreground"
                    : "text-[38px] font-bold text-muted-foreground/60"
                }`}
              >
                {a}
              </span>
              {active && (
                <span className="font-display text-lg font-semibold text-foreground">años</span>
              )}
            </div>
          );
        })}
        <div style={{ height: 152 }} />
      </div>
    </div>
  );
}
