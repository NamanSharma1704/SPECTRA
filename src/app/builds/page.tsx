import { Suspense } from "react";
import { BuildIntelligenceTable } from "@/components/builds/BuildIntelligenceTable";
import { OperationProfilePanel } from "@/components/builds/OperationProfilePanel";

export const metadata = {
  title: "DIP | Build Explorer",
  description: "Live Division 2 meta build intelligence. Filter by activity, threat level, and archetype.",
};

export default function BuildsDatabasePage() {
  return (
    <div className="text-white font-mono">
      {/* Header */}
      <div className="mb-6 border-b border-primary/30 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary neon-text tracking-widest">
          SHD_OS // BUILD_INTELLIGENCE
        </h1>
        <p className="text-primary/60 text-xs sm:text-sm mt-1 uppercase tracking-wide">
          Live intelligence feed. Unauthorized access strictly prohibited.
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Suspense fallback={<div className="lg:col-span-3 border border-primary/20 bg-[#090909] p-5 h-64 animate-pulse">LOADING PROFILE...</div>}>
          <OperationProfilePanel />
        </Suspense>

        {/* Main table */}
        <section className="lg:col-span-9 min-w-0">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl text-primary/80 uppercase tracking-widest">Active Meta Topography</h2>
            <div className="text-xs text-primary/50 border border-primary/20 px-2 py-1 hidden sm:block">CTRL+K TO SEARCH</div>
          </div>
          <Suspense fallback={<div className="text-primary font-mono p-4 animate-pulse">DECRYPTING DATA...</div>}>
            <BuildIntelligenceTable />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
