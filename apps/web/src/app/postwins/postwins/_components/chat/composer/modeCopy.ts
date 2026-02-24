import type { ComposerMode } from "../store/types";

export function getModeCopy(mode: ComposerMode) {
  switch (mode) {
    case "record":
      return {
        placeholder: "Log what happened…",
        primaryLabel: "Log record note",
        modeLabel: "Record",
      };
    case "followup":
      return {
        placeholder: "Log a follow-up…",
        primaryLabel: "Log follow-up note",
        modeLabel: "Follow-up",
      };
    case "verify":
      return {
        placeholder: "Log a verification note…",
        primaryLabel: "Log verification note",
        modeLabel: "Verify",
      };
    case "delivery":
      return {
        placeholder: "Log a delivery note…",
        primaryLabel: "Log delivery note",
        modeLabel: "Delivery",
      };
  }
}
