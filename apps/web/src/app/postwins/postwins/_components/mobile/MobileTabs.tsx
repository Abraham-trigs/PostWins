"use client";

import { useState } from "react";
import { MessageSquare, Clock, CheckCircle, Archive } from "lucide-react";

type Tab = "all" | "recent" | "verified" | "archived";

export function MobileTabs() {
  const [active, setActive] = useState<Tab>("all");

  return (
    <div className="px-[var(--xotic-pad-4)] pb-[var(--xotic-pad-3)]">
      <div
        role="tablist"
        aria-label="Conversation filters"
        className="flex gap-2 overflow-x-auto"
      >
        <TabButton
          active={active === "all"}
          onClick={() => setActive("all")}
          icon={<MessageSquare className="h-4 w-4" />}
        >
          All
        </TabButton>

        <TabButton
          active={active === "recent"}
          onClick={() => setActive("recent")}
          icon={<Clock className="h-4 w-4" />}
        >
          Recent
        </TabButton>

        <TabButton
          active={active === "verified"}
          onClick={() => setActive("verified")}
          icon={<CheckCircle className="h-4 w-4" />}
        >
          Verified
        </TabButton>

        <TabButton
          active={active === "archived"}
          onClick={() => setActive("archived")}
          icon={<Archive className="h-4 w-4" />}
        >
          Archived
        </TabButton>
      </div>
    </div>
  );
}

/* =====================================================================================
   Internal tab primitive
   ===================================================================================== */

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "h-8 px-3 flex items-center gap-2 flex-shrink-0",
        "rounded-[var(--radius-pill)] text-xs font-semibold",
        "border transition-colors",
        "focus:outline-none focus-visible:ring-[var(--state-danger)]",
        active
          ? "bg-surface-strong border-border text-ink"
          : "bg-surface-muted border-border text-ink/70 hover:bg-surface",
      ].join(" ")}
    >
      <span className="text-ink/70">{icon}</span>
      <span>{children}</span>
    </button>
  );
}
