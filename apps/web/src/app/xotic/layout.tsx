// src/app/xotic/layout.tsx
import type { ReactNode } from "react";
import { XoticDensityRoot } from "./_components/layout/XoticDensityRoot";

export default function XoticLayout({ children }: { children: ReactNode }) {
  return <XoticDensityRoot>{children}</XoticDensityRoot>;
}
