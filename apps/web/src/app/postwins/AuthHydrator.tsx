"use client";

import { useAuthHydration } from "@/lib//hooks";

export default function AuthHydrator() {
  useAuthHydration();
  return null;
}
