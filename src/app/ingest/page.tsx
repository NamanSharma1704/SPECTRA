import { AppLayout } from "@/components/layout/AppLayout";
import { SourceControlPanel } from "@/components/ingest/SourceControlPanel";
import { LiveIngestDashboard } from "@/components/ingest/LiveIngestDashboard";
import { Database, AlertTriangle } from "lucide-react";
import { IngestDashboardClient } from "./IngestDashboardClient";
import { AdminLoginForm } from "@/components/ingest/AdminLoginForm";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DIP | Ingestion Pipeline",
  description: "Real-time Division 2 build ingestion pipeline. YouTube + Reddit scanning, build extraction, staging and commit.",
};

export default async function IngestPage() {
  const apiKeyConfigured = !!process.env.YOUTUBE_API_KEY;
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_passphrase")?.value === process.env.ADMIN_PASSPHRASE;

  return (
    <AppLayout>
      <div className="min-h-screen text-gray-200">
        {!isAuthenticated ? (
          <div className="max-w-7xl mx-auto py-8 px-4">
            <AdminLoginForm />
          </div>
        ) : (
        <IngestDashboardClient>
          <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 pb-24">

            {/* Page Header */}
            <div className="ingest-header mb-8 border-b border-primary/20 pb-6 relative">
              <div className="absolute -bottom-[1px] left-0 w-48 h-[2px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
              <div className="text-[10px] font-sans font-bold text-gray-500 tracking-[0.3em] mb-3 uppercase">
                SHD_OS // DATA_PIPELINE // INGESTION_CONTROL
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black font-heading text-primary neon-text tracking-widest uppercase">
                    Build Ingestion Pipeline
                  </h1>
                  <p className="text-xs text-primary/70 mt-2 font-sans tracking-[0.2em] uppercase font-bold drop-shadow-sm">
                    Scan → Extract → Stage → Review → Commit to production
                  </p>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-sans font-bold tracking-widest uppercase bg-black/40 border border-white/10 px-4 py-2 rounded-sm shadow-md">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${apiKeyConfigured ? "bg-emerald-400 text-emerald-400" : "bg-amber-400 text-amber-400 animate-pulse"}`} />
                    <span className={apiKeyConfigured ? "text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]" : "text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]"}>
                      YOUTUBE: {apiKeyConfigured ? "LIVE" : "DEMO"}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 text-emerald-400 shadow-[0_0_5px_currentColor]" />
                    <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]">REDDIT: LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Key warning */}
            {!apiKeyConfigured && (
              <div className="ingest-panel mb-6 border border-amber-500/40 bg-amber-900/10 px-5 py-4 flex items-start gap-3 shadow-[0_0_15px_rgba(251,191,36,0.1)] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                <div className="text-xs font-sans">
                  <div className="text-amber-400 font-bold mb-1 tracking-widest uppercase drop-shadow-sm">YOUTUBE_API_KEY NOT CONFIGURED</div>
                  <div className="text-gray-400 leading-relaxed tracking-wide">
                    YouTube scanner will run in demo mode. Add{" "}
                    <code className="text-amber-300 bg-amber-900/40 px-1 py-0.5 rounded border border-amber-500/20">YOUTUBE_API_KEY=your_key</code> to{" "}
                    <code className="text-amber-300 bg-amber-900/40 px-1 py-0.5 rounded border border-amber-500/20">.env.local</code> and restart the dev server.
                  </div>
                </div>
              </div>
            )}

            {/* Main grid */}
            <div className="space-y-8">

              <div className="ingest-panel">
                {/* Trigger buttons */}
                <SourceControlPanel apiKeyConfigured={apiKeyConfigured} />
              </div>

              <div className="ingest-panel">
                {/* Live polling dashboard — stats + queue + log */}
                <LiveIngestDashboard apiKeyConfigured={apiKeyConfigured} />
              </div>

              {/* Pipeline architecture */}
              <div className="ingest-panel glass-panel p-6 border-l-4 border-l-gray-600">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-heading font-bold text-gray-300 tracking-widest uppercase">Pipeline Architecture</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-sans font-bold text-center uppercase tracking-widest relative">
                  {/* Decorative line connecting the steps */}
                  <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-white/10 -translate-y-1/2 z-0" />

                  {[
                    { step: "01", label: "FETCH",   desc: "YouTube + Reddit",      color: "text-cyan-400 border-cyan-500/30", icon: "🌐" },
                    { step: "02", label: "EXTRACT", desc: "BuildExtractor NLP",    color: "text-orange-400 border-orange-500/30", icon: "🧠" },
                    { step: "03", label: "STAGE",   desc: "Queue for review",      color: "text-amber-400 border-amber-500/30", icon: "⏳" },
                    { step: "04", label: "REVIEW",  desc: "Manual approve/reject", color: "text-purple-400 border-purple-500/30", icon: "👁️" },
                    { step: "05", label: "COMMIT",  desc: "Write to Supabase",     color: "text-emerald-400 border-emerald-500/30", icon: "✅" },
                  ].map((s) => (
                    <div key={s.step} className={`flex flex-col items-center gap-2 p-4 border bg-black/60 relative z-10 transition-transform hover:-translate-y-1 hover:shadow-lg ${s.color}`}>
                      <div className="text-2xl mb-1 opacity-80">{s.icon}</div>
                      <div className={`text-xl font-heading drop-shadow-[0_0_5px_currentColor]`}>{s.step}</div>
                      <div className={`font-black drop-shadow-[0_0_2px_currentColor]`}>{s.label}</div>
                      <div className="text-[9px] text-gray-500 mt-1">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </IngestDashboardClient>
        )}
      </div>
    </AppLayout>
  );
}
