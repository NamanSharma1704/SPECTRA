"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PipelineStats {
  totalStaged: number;
  pending: number;
  committed: number;
  rejected: number;
  jobCount: number;
  lastRun: string | null;
}

interface IngestStatus {
  stats: PipelineStats;
  queue: any[];
  log: any[];
  apiKeyConfigured: boolean;
}

interface LiveIngestDashboardProps {
  apiKeyConfigured: boolean;
}

export function LiveIngestDashboard({ apiKeyConfigured }: LiveIngestDashboardProps) {
  const [status, setStatus] = useState<IngestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ingest/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setLastRefresh(new Date());
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const stats = status?.stats;
  const queue = status?.queue ?? [];
  const log = (status?.log ?? []).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TOTAL STAGED", value: stats?.totalStaged ?? 0, color: "text-white" },
          { label: "PENDING",      value: stats?.pending ?? 0,      color: "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" },
          { label: "COMMITTED",    value: stats?.committed ?? 0,    color: "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" },
          { label: "JOBS RUN",     value: stats?.jobCount ?? 0,     color: "text-primary drop-shadow-[0_0_5px_rgba(255,106,0,0.8)]" },
        ].map((s) => (
          <div key={s.label} className="glass-panel p-4 text-center border-t-2 border-t-primary/30">
            <div className="text-[10px] font-sans font-bold text-gray-500 tracking-[0.2em] mb-2 uppercase">{s.label}</div>
            <div className={`text-4xl font-black font-heading ${s.color} ${loading ? "animate-pulse" : ""}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Refresh indicator */}
      <div className="flex items-center gap-2 text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest bg-black/20 p-2 rounded">
        <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin-slow" />
        <span suppressHydrationWarning>Auto-refresh 5s · Last: {lastRefresh.toLocaleTimeString()}</span>
        <button onClick={refresh} className="ml-auto text-primary hover:text-white transition-colors flex items-center gap-1 border border-primary/30 px-2 py-1 rounded-sm bg-primary/10">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Live staging queue */}
      {queue.length > 0 && (
        <div className="glass-panel p-5 border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
            <span className="text-sm font-heading font-bold text-white tracking-widest uppercase drop-shadow-md">Live Staging Queue</span>
            <span className="ml-auto text-[10px] font-sans font-bold tracking-widest text-amber-400 bg-amber-900/30 px-2 py-1 border border-amber-500/30">{queue.filter((b) => b.status === "PENDING").length} PENDING</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 min-w-[700px]">
              <AnimatePresence>
              {queue.map((build) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={build.id} 
                  className={`flex items-center gap-3 border px-4 py-3 text-xs font-sans font-bold tracking-widest uppercase transition-colors ${
                  build.status === "COMMITTED" ? "border-emerald-900/50 bg-emerald-900/10 opacity-50" :
                  build.status === "REJECTED"  ? "border-red-900/50 bg-red-900/10 opacity-40" :
                  "border-white/10 bg-white/5 hover:bg-white/10"
                }`}>
                  <span className={`px-2 py-1 text-[9px] font-bold flex-shrink-0 border ${
                    build.source === "youtube" ? "bg-red-900/30 text-red-400 border-red-500/30" : 
                    build.source === "steam" ? "bg-purple-900/30 text-purple-400 border-purple-500/30" : 
                    "bg-orange-900/30 text-orange-400 border-orange-500/30"
                  }`}>{build.source}</span>
                  <span className="flex-1 text-white font-bold truncate">{build.inferredName}</span>
                  <span className="text-gray-500 flex-shrink-0">[{build.archetype ?? "?"}]</span>
                  <span className={`flex-shrink-0 font-bold ${
                    build.confidence >= 80 ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" : "text-amber-400"
                  }`}>{build.confidence}%</span>
                  <span className={`text-[9px] flex-shrink-0 ${
                    build.status === "COMMITTED" ? "text-emerald-400" :
                    build.status === "REJECTED"  ? "text-red-500" : "text-amber-400 animate-pulse"
                  }`}>{build.status}</span>
                  {build.status === "PENDING" && (
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <button onClick={async () => {
                        await fetch("/api/ingest/commit", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "commit", buildId: build.id }) });
                        refresh();
                      }} className="w-6 h-6 flex items-center justify-center border border-emerald-500/50 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">✓</button>
                      <button onClick={async () => {
                        await fetch("/api/ingest/commit", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "reject", buildId: build.id }) });
                        refresh();
                      }} className="w-6 h-6 flex items-center justify-center border border-red-500/50 bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-black transition-colors text-xs shadow-[0_0_10px_rgba(239,68,68,0.2)]">✗</button>
                    </div>
                  )}
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Live log */}
      {log.length > 0 && (
        <div className="glass-panel p-5 border-l-4 border-l-gray-600">
          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
            <span className="text-sm font-heading font-bold text-gray-300 tracking-widest uppercase">Ingestion Log</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <div className="space-y-2 min-w-[600px]">
            {log.map((job) => (
              <div key={job.id} className={`flex items-center gap-3 border px-4 py-3 text-[10px] font-sans font-bold tracking-widest uppercase bg-black/40 ${
                job.status === "ERROR" ? "border-red-900/50" : "border-white/5"
              }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_5px_currentColor] ${
                  job.status === "COMPLETE" ? "bg-emerald-400 text-emerald-400" :
                  job.status === "ERROR"    ? "bg-red-500 text-red-500" : "bg-amber-400 text-amber-400 animate-pulse"
                }`} />
                <span className={`flex-shrink-0 ${
                  job.source === "youtube" ? "text-red-400" :
                  job.source === "reddit"  ? "text-orange-400" : 
                  job.source === "patches" ? "text-purple-400" : "text-primary"
                }`}>{job.source}</span>
                <span className="text-gray-500 flex-shrink-0 border-l border-white/10 pl-3 ml-1">
                  <span className="text-white">{job.stats.scanned}</span> scanned · <span className="text-cyan-400">{job.stats.staged}</span> staged
                </span>
                {job.stats.errors > 0 && <span className="text-red-400 bg-red-900/30 px-2 py-0.5 border border-red-900">{job.stats.errors} errors</span>}
                <span className="ml-auto text-gray-600 flex-shrink-0">
                  {new Date(job.startedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
