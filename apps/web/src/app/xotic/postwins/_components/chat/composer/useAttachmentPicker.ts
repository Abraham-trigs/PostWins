"use client";

import { useEffect, useRef, useState } from "react";
import type { EvidenceKind } from "../store/types";

export function useAttachmentPicker() {
  const [attachOpen, setAttachOpen] = useState(false);
  const attachWrapRef = useRef<HTMLDivElement | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const root = attachWrapRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setAttachOpen(false);
    };
    if (attachOpen) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [attachOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAttachOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const triggerAttach = (kind: EvidenceKind) => {
    if (kind === "image") imageInputRef.current?.click();
    if (kind === "video") videoInputRef.current?.click();
    if (kind === "document") docInputRef.current?.click();
    if (kind === "audio") audioInputRef.current?.click();
  };

  return {
    attachOpen,
    setAttachOpen,
    attachWrapRef,
    triggerAttach,
    imageInputRef,
    videoInputRef,
    docInputRef,
    audioInputRef,
  };
}
