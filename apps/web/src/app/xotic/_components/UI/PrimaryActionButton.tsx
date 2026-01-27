// app/components/ui/PrimaryActionButton.tsx
"use client";

type PrimaryActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export function PrimaryActionButton({
  label,
  onClick,
  disabled,
}: PrimaryActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-10 px-5 rounded-[var(--radius-pill)]",
        "text-ink font-semibold text-sm",
        "bg-[var(--brand-primary)] hover:opacity-95 transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95",
      ].join(" ")}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
}
