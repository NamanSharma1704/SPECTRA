"use client";
import { useState } from "react";
import { Play, Tv2, MessageSquare, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Source = "youtube" | "reddit" | "patches" | "full";

interface TriggerResult {
  job?: any;
  result?: any;
  error?: string;
}

export function SourceControlPanel({ apiKeyConfigured }: { apiKeyConfigured: boolean }) {
  const [running, setRunning] = useState<Source | null>(null);
  const [results, setResults] = useState<Record<Source, TriggerResult>>({} as any);

  async function trigger(source: Source) {
    setRunning(source);
    try {
      let res: Response;
      if (source === "full") {
        res = await fetch("/api/ingest/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run_full" }),
        });
      } else {
        res = await fetch(`/api/ingest/${source}`, { method: "POST" });
      }
      const data = await res.json();
      setResults((prev) => ({ ...prev, [source]: data }));
    } catch (err: any) {
      setResults((prev) => ({ ...prev, [source]: { error: err.message } }));
    } finally {
      setRunning(null);
    }
  }

  const sources = [
    {
      id: "youtube" as Source,
      label: "YouTube Scanner",
      desc: `Scans ${apiKeyConfigured ? "live YouTube channel" : "demo mode — add YOUTUBE_API_KEY"}`,
      icon: Tv2,
      color: "border-red-500/30 bg-red-900/10 hover:border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
      iconColor: "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]",
      btnColor: "border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black",
      requiresKey: true,
    },
    {
      id: "reddit" as Source,
      label: "Reddit Scanner",
      desc: "Scans r/thedivision + r/Division2Builds (no key needed)",
      icon: MessageSquare,
      color: "border-orange-500/30 bg-orange-900/10 hover:border-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.1)]",
      iconColor: "text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]",
      btnColor: "border-orange-500/50 text-orange-400 hover:bg-orange-500 hover:text-black",
      requiresKey: false,
    },
    {
      id: "patches" as Source,
      label: "Official Patches",
      desc: "Scans Steam News API for latest Title Updates",
      icon: Zap,
      color: "border-purple-500/30 bg-purple-900/10 hover:border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
      iconColor: "text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]",
      btnColor: "border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-black",
      requiresKey: false,
    },
    {
      id: "full" as Source,
      label: "Full Pipeline",
      desc: "Run all sources simultaneously",
      icon: Zap,
      color: "border-primary/30 bg-primary/5 hover:border-primary/60 shadow-[0_0_10px_rgba(255,106,0,0.1)]",
      iconColor: "text-primary drop-shadow-[0_0_5px_rgba(255,106,0,0.8)]",
      btnColor: "border-primary/50 text-primary hover:bg-primary hover:text-black",
      requiresKey: false,
    },
  ];

  return (
    <div className="glass-panel p-6 border-l-4 border-l-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-heading font-bold text-white tracking-widest uppercase drop-shadow-md">
          Ingestion Sources
        </h2>
        {!apiKeyConfigured && (
          <span className="ml-auto text-[10px] font-sans font-bold tracking-widest text-amber-400 bg-amber-900/30 border border-amber-500/30 px-3 py-1 uppercase">
            YOUTUBE KEY MISSING — DEMO MODE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sources.map((src) => {
          const Icon = src.icon;
          const isRunning = running === src.id;
          const result = results[src.id];
          const job = result?.job;
          const apiResult = result?.result;

          return (
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              key={src.id} 
              className={`border ${src.color} p-5 transition-all flex flex-col`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-5 h-5 ${src.iconColor}`} />
                <span className={`text-sm font-heading font-bold uppercase tracking-widest ${src.iconColor}`}>{src.label}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-sans tracking-wide mb-5 leading-relaxed flex-1 uppercase">{src.desc}</p>

              {/* Result summary */}
              {job && (
                <div className="mb-4 text-[10px] font-sans font-bold tracking-widest uppercase space-y-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>SCANNED</span><span className="text-white bg-white/10 px-2 py-0.5">{job.stats?.scanned ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>EXTRACTED</span><span className="text-orange-400 bg-orange-900/30 px-2 py-0.5">{job.stats?.extracted ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>STAGED</span><span className="text-cyan-400 bg-cyan-900/30 px-2 py-0.5">{job.stats?.staged ?? 0}</span>
                  </div>
                </div>
              )}
              {result?.error && (
                <div className="mb-4 text-[10px] font-sans font-bold bg-red-900/30 text-red-400 p-2 border border-red-500/30 truncate uppercase">{result.error}</div>
              )}

              <button
                onClick={() => trigger(src.id)}
                disabled={isRunning || running !== null}
                className={`w-full flex items-center justify-center gap-2 py-3 text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all mt-auto
                  ${isRunning || running !== null
                    ? "border border-gray-700/50 bg-gray-900/50 text-gray-600 cursor-not-allowed"
                    : `${src.btnColor} border shadow-sm cursor-pointer`
                  }`}
              >
                {isRunning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> RUNNING...</>
                ) : job ? (
                  <><CheckCircle className="w-4 h-4" /> RUN AGAIN</>
                ) : (
                  <><Play className="w-4 h-4" /> TRIGGER</>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
