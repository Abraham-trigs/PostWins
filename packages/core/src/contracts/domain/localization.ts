// packages/core/src/contracts/domain/localization.ts
// Purpose: Localization detection contract

export type LocalizationContext = {
  detectedLanguage: string;
  confidence: number;
  regionalDialect?: string;
  requiresTranslation: boolean;
};
