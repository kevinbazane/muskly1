import { Link } from "@tanstack/react-router";
import { CalendarDays, Dumbbell, Salad, BarChart3, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Diario", icon: CalendarDays, exact: true },
  { to: "/ejercicios", label: "Ejercicios", icon: Dumbbell, exact: false },
  { to: "/nutricion", label: "Nutrición", icon: Salad, exact: false },
  { to: "/informe", label: "Informe", icon: BarChart3, exact: false },
  { to: "/perfil", label: "Perfil", icon: User, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] border-t border-border bg-card/95 backdrop-blur">
      <ul className="grid grid-cols-5 px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <Icon size={22} strokeWidth={2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
