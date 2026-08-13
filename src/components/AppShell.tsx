import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pt-8 pb-4">
      <div className="min-w-0">
        <h1 className="font-display truncate text-2xl font-bold text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  );
}

export function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <AppShell>
      <ScreenHeader title={title} subtitle={description} />
      <div className="px-5">
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-[0_8px_30px_-18px_rgba(0,0,0,0.35)]">
          <p className="text-sm text-muted-foreground">
            Estamos preparando esta sección. Muy pronto la tendrás lista aquí.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
