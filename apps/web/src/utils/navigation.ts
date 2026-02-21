// src/utils/navigation.ts
// Purpose: Stateless navigation handler for Message Signals.

import type { BackendNavigationContext } from "@/lib/api/message";

/**
 * handleNavigation
 *
 * Logic flow:
 * 1. Identify target (Internal vs External).
 * 2. Locate DOM element by ID for internal jumps.
 * 3. Execute smooth scroll and visual "flash" highlight.
 * 4. Open secure new tab for external portals.
 */
export const handleNavigation = (context: BackendNavigationContext) => {
  const { target, id, params } = context;

  // 1. Handle External Deep Links (School portals, GIS, etc.)
  if (target === "EXTERNAL") {
    // Standard secure tab opening
    window.open(id, "_blank", "noopener,noreferrer");
    return;
  }

  // 2. Handle Internal Navigation (TASKS or MESSAGES)
  // Ensure the target element exists in the DOM.
  // Note: Your Task cards and Message bubbles MUST have id={id}
  const element = document.getElementById(id);

  if (!element) {
    console.warn(
      `[Navigation] Target ${target} with ID "${id}" not found in current view.`,
    );
    return;
  }

  // A. Execute Smooth Scroll
  element.scrollIntoView({
    behavior: "smooth",
    block: params?.mode === "peek" ? "center" : "start",
    inline: "nearest",
  });

  // B. Visual Highlight (The "Signal" pulse)
  if (params?.highlight) {
    // Add a temporary CSS class for visual feedback
    element.classList.add(
      "ring-2",
      "ring-ocean",
      "ring-offset-2",
      "transition-all",
      "duration-500",
    );

    // Remove the highlight after the user has seen it (2 seconds)
    setTimeout(() => {
      element.classList.remove("ring-2", "ring-ocean", "ring-offset-2");
    }, 2000);
  }

  // C. Accessibility Focus
  if (params?.focus) {
    // Focus the element without triggering a second jump
    (element as HTMLElement).focus({ preventScroll: true });
  }
};
