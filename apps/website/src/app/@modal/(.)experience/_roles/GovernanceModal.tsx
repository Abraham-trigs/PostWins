// apps/website/src/app/@modal/(.)experience/[role]/_roles/GovernanceModal.tsx
import { STAKEHOLDER_COPY } from "@/_lib/stakeholder-content";
import { PrimaryRole } from "@/_lib/experience.types";

export default function GovernanceModal({
  role,
}: {
  role: Exclude<PrimaryRole, null>;
}) {
  const copy = STAKEHOLDER_COPY[role];

  return (
    <div className="p-10 space-y-8 bg-slate-950">
      <header className="space-y-3">
        <div className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.3em]">
          Deterministic Protocol: {role}
        </div>
        <h2 className="text-3xl font-black text-white leading-tight">
          {copy.hero.headline}
        </h2>
      </header>

      <section className="space-y-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
            The Constraint (Problem)
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {/* FIX: Accessed .body property */}
            {copy.problem.body}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-blue-600/5 border border-blue-500/20">
          <h4 className="text-xs font-bold text-blue-500 uppercase mb-2">
            The Enforcement (Solution)
          </h4>
          <p className="text-slate-100 text-sm leading-relaxed">
            {/* FIX: Accessed .summary property */}
            {copy.solution.summary}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900">
        <div>
          <span className="block text-[10px] text-slate-500 uppercase">
            Architecture Layer
          </span>
          <span className="text-sm font-bold text-white">
            {/* FIX: Aligned with architectureFocus.layer */}
            {copy.architectureFocus.layer}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase">
            Enforcement Method
          </span>
          <span className="text-sm font-bold text-blue-400">
            {/* FIX: Aligned with architectureFocus.enforcement */}
            {copy.architectureFocus.enforcement}
          </span>
        </div>
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl text-lg transition-colors">
        Enter {role} Workspace
      </button>
    </div>
  );
}
