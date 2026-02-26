// File: components/LabeledInput.tsx
// Purpose: Reusable input component with label, optional suffix, and error display; styled with theme variables.

"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

// Props interface for LabeledInput
interface LabeledInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string; // Field label displayed above input
  error?: string; // Optional error message
  onChangeValue?: (value: string) => void; // Callback for value changes
  suffix?: string; // Optional suffix displayed inside the input
}

export default function LabeledInput({
  label,
  error,
  onChangeValue,
  suffix,
  ...props
}: LabeledInputProps) {
  return (
    <div className="flex flex-col w-full mb-5 group">
      {/* Sleek Label: Uses ark-lightblue by default, transitions to cyan on focus */}
      <label
        className="mb-2 text-[12px] font-black uppercase tracking-[0.1em] text-ark-lightblue
      opacity-60 group-focus-within:opacity-100 group-focus-within:text-ark-cyan transition-all duration-300"
      >
        {label}
      </label>

      <div className="relative w-full">
        {/* Input Field: styled with theme colors, rounded, and focus states */}
        <input
          {...props} // Spread remaining input props (e.g., placeholder, type)
          onChange={(e) => onChangeValue?.(e.target.value)} // Trigger callback on change
          className={`
            w-full bg-ark-lightblue text-ark-navy rounded-lg border px-4 py-3 text-m transition-all duration-300 outline-none
            placeholder:text-ark-navy/40
            ${suffix ? "pr-20" : ""} // Add padding if suffix exists
            ${
              error
                ? "border-ark-red bg-ark-red/5 focus:ring-2 focus:ring-ark-red/30" // Error state
                : "border-ark-lightblue/10 focus:ring-2 focus:ring-ark-cyan/40 focus:border-ark-cyan/50 shadow-lg shadow-black/20" // Normal state
            }
          `}
        />

        {/* Optional Suffix: Displayed on the right inside the input */}
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-3">
            {/* Divider line */}
            <div className="w-[1px] h-4 bg-ark-lightblue/20" />
            {/* Suffix text */}
            <span className="text-[10px] font-black text-ark-cyan opacity-90 uppercase tracking-widest">
              {suffix}
            </span>
          </div>
        )}
      </div>

      {/* Error Message: Displayed below input with icon and animation */}
      {error && (
        <div className="flex items-center gap-1.5 mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
          <AlertCircle size={12} className="text-ark-red" />
          <span className="text-ark-red text-[10px] font-bold uppercase tracking-widest">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
