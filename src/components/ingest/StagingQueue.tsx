"use client";
import { useState } from "react";
import { Check, X, ExternalLink, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Shield, ShieldMinus } from "lucide-react";

interface TrustMetrics {
  creatorReliability: number;
  patchFreshness: number;
  sourceDiversity: number;
  communityValidation: number;
  similarityScore: number;
}

interface StagedBuild {
  id: string;
  inferredName: string;
  archetype: string | null;
  creatorName: string;
  source: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceRole: "origin" | "validation" | "discussion" | "community";
  fingerprint: string;
  isAppend: boolean;
  confidence: number;
  gearKeywords: string[];
  activityKeywords: string[];
  status: "PENDING" | "COMMITTED" | "REJECTED";
  stagedAt: string;
  verificationStatus: "Verified" | "Likely Valid" | "Needs Review" | "Filtered";
  trustMetrics: TrustMetrics;
}

export function StagingQueue({ initialQueue }: { initialQueue: StagedBuild[] }) {
  const [queue, setQueue] = useState<StagedBuild[]>(initialQueue);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Verified" | "Likely Valid" | "Needs Review" | "Filtered">("Verified");

  const pending = queue.filter((b) => b.status === "PENDING");
  
  // Group PENDING by verification status
  const grouped = {
    "Verified": pending.filter((b) => b.verificationStatus === "Verified"),
    "Likely Valid": pending.filter((b) => b.verificationStatus === "Likely Valid"),
    "Needs Review": pending.filter((b) => b.verificationStatus === "Needs Review"),
    "Filtered": pending.filter((b) => b.verificationStatus === "Filtered"),
  };

  const currentList = grouped[activeTab];

  async function act(id: string, action: "commit" | "reject") {
    const res = await fetch("/api/ingest/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, buildId: id }),
    });
    if (res.ok) {
      setQueue((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: action === "commit" ? "COMMITTED" : "REJECTED" } : b
        )
      );
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "Verified": return <ShieldCheck className="w-4 h-4 text-green-400" />;
      case "Likely Valid": return <Shield className="w-4 h-4 text-blue-400" />;
      case "Needs Review": return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
      case "Filtered": return <ShieldMinus className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  }

  return (
    <div className="border border-gray-800 bg-black/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-cyan-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          Build Verification Engine
        </h2>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 border-b border-gray-800 pb-2">
        {(["Verified", "Likely Valid", "Needs Review", "Filtered"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === tab 
                ? "bg-gray-800 text-white" 
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
            }`}
          >
            {getStatusIcon(tab)}
            {tab.toUpperCase()} ({grouped[tab].length})
          </button>
        ))}
      </div>

      {currentList.length === 0 ? (
        <div className="text-center py-8 text-gray-700 text-xs font-mono">
          NO PENDING BUILDS IN THIS QUEUE
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {currentList.map((build) => (
            <div
              key={build.id}
              className="border border-gray-700 bg-black/20 transition-all"
            >
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Source badge */}
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 flex-shrink-0 ${
                  build.source === "youtube" ? "bg-red-950 text-red-400 border border-red-800/40" :
                  "bg-orange-950 text-orange-400 border border-orange-800/40"
                }`}>
                  {build.source.toUpperCase()}
                </span>

                {/* Build name and Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-bold text-sm text-white truncate">{build.sourceTitle}</div>
                    {build.isAppend && (
                      <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-1 font-bold">APPEND TO FAMILY</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    [{build.archetype ?? "UNKNOWN"}] · Fingerprint: {build.fingerprint}
                  </div>
                </div>

                {/* Diversity / Confidence */}
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <span className="text-[9px] text-gray-500 font-mono block">DIVERSITY</span>
                    <span className="text-xs font-black font-mono text-cyan-400">{build.trustMetrics.sourceDiversity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 font-mono block">CONFIDENCE</span>
                    <div className={`text-sm font-black font-mono ${
                      build.confidence >= 80 ? "text-green-400" :
                      build.confidence >= 65 ? "text-orange-400" : "text-yellow-500"
                    }`}>
                      {build.confidence}%
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  <button
                    onClick={() => act(build.id, "commit")}
                    className="p-1.5 border border-green-700/50 text-green-400 hover:bg-green-900/30 transition-all"
                    title="Commit to database"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => act(build.id, "reject")}
                    className="p-1.5 border border-red-800/50 text-red-500 hover:bg-red-950/30 transition-all"
                    title="Reject"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === build.id ? null : build.id)}
                    className="p-1.5 border border-gray-700 text-gray-500 hover:text-white transition-all"
                  >
                    {expanded === build.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === build.id && (
                <div className="border-t border-gray-800 px-4 py-3 bg-gray-900/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Metadata */}
                    <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">SOURCE:</span>
                        <a href={build.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]">
                          {build.sourceUrl} <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      </div>
                      {build.gearKeywords.length > 0 && (
                        <div>
                          <span className="text-gray-500">GEAR: </span>
                          <span className="text-cyan-400">{build.gearKeywords.join(", ")}</span>
                        </div>
                      )}
                      {build.activityKeywords.length > 0 && (
                        <div>
                          <span className="text-gray-500">ACTIVITY: </span>
                          <span className="text-orange-400">{build.activityKeywords.join(", ")}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">STAGED: </span>
                        <span className="text-gray-400">{new Date(build.stagedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Right: Trust Layer Metrics */}
                    <div className="bg-black/40 border border-gray-800 p-3 text-[10px] font-mono">
                      <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider flex items-center justify-between">
                        <span>Trust Layer Analysis</span>
                        {build.trustMetrics.similarityScore === 100 && (
                          <span className="text-red-500 bg-red-950 px-1 py-0.5">DUPLICATE DETECTED</span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Creator Reliability</span>
                          <span className="text-white">{build.trustMetrics.creatorReliability}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Patch Freshness</span>
                          <span className="text-white">{build.trustMetrics.patchFreshness}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Source Diversity</span>
                          <span className="text-white">{build.trustMetrics.sourceDiversity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Community Validation</span>
                          <span className="text-white">{build.trustMetrics.communityValidation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
