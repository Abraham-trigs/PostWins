"use client";

export default function RequestDemoSection() {
  return (
    <section className="bg-slate-950 py-32 border-t border-slate-900">
      <div className="max-w-3xl mx-auto px-6 space-y-10 text-center">
        <h1 className="text-5xl font-black text-white tracking-tight">
          Institutional Demonstration
        </h1>

        <p className="text-slate-400">
          Explore deterministic lifecycle enforcement, tenant isolation, and
          ledger-backed governance in a guided walkthrough.
        </p>

        <a
          href="mailto:demo@postwins.io"
          className="inline-block mt-8 px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition"
        >
          Schedule Demonstration
        </a>
      </div>
    </section>
  );
}
