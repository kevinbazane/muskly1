import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/AppShell";

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
  component: () => (
    <Placeholder
      title="Ejercicios"
      description="Rutinas en casa o gimnasio, calendario semanal y temporizador de descansos."
    />
  ),
});
