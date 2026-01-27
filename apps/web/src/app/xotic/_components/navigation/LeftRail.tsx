"use client";

import { Bolt, FolderKanban, Settings } from "lucide-react";

type TabKey = "postwins" | "projects" | "settings";

export function LeftRail() {
  const active: TabKey = "postwins"; // current view

  return (
    <aside
      aria-label="Primary rail"
      className="
        w-[var(--xotic-rail-w)]
        flex-shrink-0
        border-r border-border
        bg-surface-muted
        flex flex-col
        items-center
        py-[var(--xotic-pad-4)]
        gap-2
      "
    >
      {/* Top logo / app switcher */}
      <div
        aria-hidden="true"
        className="
          h-10 w-10
          rounded-xl
          bg-surface
          border border-border
          mb-3
          flex items-center justify-center
        "
      >
        <Bolt className="h-5 w-5 text-ink/80" aria-hidden="true" />
      </div>

      {/* Tabs */}
      <RailButton
        label="PostWins"
        active={active === "postwins"}
        icon={<Bolt className="h-5 w-5" aria-hidden="true" />}
      />

      <RailButton
        label="Projects"
        active={active === "projects"}
        icon={<FolderKanban className="h-5 w-5" aria-hidden="true" />}
      />

      <RailButton
        label="Settings"
        active={active === "settings"}
        icon={<Settings className="h-5 w-5" aria-hidden="true" />}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom utility */}
      <button
        type="button"
        aria-label="Quick settings"
        className={[
          "h-9 w-9 rounded-lg",
          "bg-surface border border-border",
          "flex items-center justify-center",
          "text-ink/80 hover:text-ink",
          "hover:bg-surface-strong transition-colors",
          "focus:outline-none focus-visible:ring-[var(--state-danger)]",
        ].join(" ")}
      >
        <Settings className="h-4.5 w-4.5" aria-hidden="true" />
      </button>
    </aside>
  );
}

function RailButton({
  label,
  active,
  icon,
}: {
  label: string;
  active?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={[
        "relative h-11 w-11 rounded-xl",
        "flex items-center justify-center",
        "border transition-colors",
        "focus:outline-none focus-visible:ring-[var(--state-danger)]",
        active
          ? "bg-surface-strong border-border text-ink"
          : "bg-transparent border-transparent text-ink/70 hover:bg-surface hover:text-ink",
      ].join(" ")}
    >
      {/* Active indicator */}
      <span
        aria-hidden="true"
        className={[
          "absolute left-0 top-2 bottom-2 w-1 rounded-r",
          active ? "bg-red" : "bg-transparent",
        ].join(" ")}
      />

      {/* Icon */}
      <span className={active ? "text-ink" : "text-ink/70"}>{icon}</span>
    </button>
  );
}
