// packages/ui/src/components/FocusTrap.tsx
"use client";

import { ReactNode } from "react";
import FocusTrapReact from "focus-trap-react";

export function FocusTrap({
  children,
  active = true,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <FocusTrapReact
      active={active}
      focusTrapOptions={{ allowOutsideClick: true }}
    >
      <div className="contents">{children}</div>
    </FocusTrapReact>
  );
}
