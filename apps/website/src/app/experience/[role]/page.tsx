// apps/website/src/app/(experience)/[role]/page.tsx
import { notFound } from "next/navigation";
import { PRIMARY_ROLES } from "@/_lib/experience.types";

export async function generateStaticParams() {
  return PRIMARY_ROLES.map((role) => ({
    role: role,
  }));
}

export default async function RoleExperiencePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  // Validation: Ensure the role exists in our governance engine
  if (!PRIMARY_ROLES.includes(role as any)) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-fade-in">
      <header className="mb-12 border-b border-slate-800 pb-8">
        <span className="text-blue-500 font-mono text-sm tracking-widest uppercase">
          Stakeholder Perspective
        </span>
        <h1 className="text-5xl font-extrabold mt-4 capitalize">
          {role.replace("_", " ")}{" "}
          <span className="text-slate-500">Workspace</span>
        </h1>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Metric 1 */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-slate-400 text-sm font-medium">
            Compliance Index
          </h3>
          <p className="text-3xl font-bold mt-2">98.2%</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-slate-400 text-sm font-medium">Verified Nodes</h3>
          <p className="text-3xl font-bold mt-2">1,402</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-slate-400 text-sm font-medium">
            Active Proposals
          </h3>
          <p className="text-3xl font-bold mt-2">14</p>
        </div>
      </div>

      <section className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-900/20">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Next Step for {role}s
        </h2>
        <p className="text-blue-100 mb-6 max-w-xl">
          Enter the secure portal to finalize your governance credentials and
          begin verifying infrastructure impacts.
        </p>
        <button className="px-6 py-3 bg-white text-blue-700 rounded-full font-bold hover:bg-blue-50 transition-colors">
          Access Secure Web App
        </button>
      </section>
    </div>
  );
}
