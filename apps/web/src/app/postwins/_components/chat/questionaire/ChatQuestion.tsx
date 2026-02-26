import React from "react";

export default function ChatQuestion({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-xl rounded-2xl bg-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      {children}
    </div>
  );
}
