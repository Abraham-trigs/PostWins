// apps/web/src/app/(dashboard)/page.tsx
import ExperienceLogFeed from "@/components/dashboard/ExperienceLogFeed";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats (Relational Data) */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold">Governance Overview</h1>
          {/* Your existing Relational stats here... */}
        </div>

        {/* Temporal Logs (Experience Data) */}
        <aside>
          <ExperienceLogFeed />
        </aside>
      </div>
    </div>
  );
}
