import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/AppShell";

export const Route = createFileRoute("/informe")({
  head: () => ({
    meta: [
      { title: "Informe | Muskly" },
      {
        name: "description",
        content: "Evolución de peso y masa muscular, mediciones y consistencia semanal.",
      },
      { property: "og:title", content: "Informe | Muskly" },
      {
        property: "og:description",
        content: "Evolución de peso y masa muscular, mediciones y consistencia semanal.",
      },
    ],
  }),
  component: () => (
    <Placeholder
      title="Informe"
      description="Gráficos de progreso, mediciones, fotos y análisis de tu constancia."
    />
  ),
});
