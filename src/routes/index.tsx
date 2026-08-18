import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muskly | Tu plan para ganar masa muscular" },
      {
        name: "description",
        content:
          "Entrena, come y mide tu progreso con un plan diseñado para ganar músculo de forma saludable y constante.",
      },
      { property: "og:title", content: "Muskly | Tu plan para ganar masa muscular" },
      {
        property: "og:description",
        content: "Entrena, come y mide tu progreso con un plan diseñado para ganar músculo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <Navigate to="/ejercicios" replace />,
});
