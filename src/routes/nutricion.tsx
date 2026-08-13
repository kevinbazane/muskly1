import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/AppShell";

export const Route = createFileRoute("/nutricion")({
  head: () => ({
    meta: [
      { title: "Nutrición | Muskly" },
      {
        name: "description",
        content: "Plan nutricional para hipertrofia con menú diario y control de macros.",
      },
      { property: "og:title", content: "Nutrición | Muskly" },
      {
        property: "og:description",
        content: "Plan nutricional para hipertrofia con menú diario y control de macros.",
      },
    ],
  }),
  component: () => (
    <Placeholder
      title="Nutrición"
      description="Menú diario, alimentos clave, suplementación y contador de macros."
    />
  ),
});
