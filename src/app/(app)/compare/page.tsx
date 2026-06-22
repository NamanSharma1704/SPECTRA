"use client";

import { useState, useEffect } from "react";
import { BuildComparisonVisualizer } from "@/components/intel/BuildComparisonVisualizer";
import { RefreshCw } from "lucide-react";

export default function ComparePage() {
  const [scope, setScope] = useState("Global");
  const [availableBuilds, setAvailableBuilds] = useState<any[]>([]);
  const [buildAId, setBuildAId] = useState<string>("");
  const [buildBId, setBuildBId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Fetch available builds when scope changes
  useEffect(() => {
    async function fetchBuilds() {
      setLoading(true);
      try {
        const res = await fetch(`/api/compare?scope=${encodeURIComponent(scope)}`);
        const data = await res.json();
        if (data.builds) {
          setAvailableBuilds(data.builds);
          // Auto-select first two if none selected, or reset if not available in new scope
          if (data.builds.length > 1) {
            setBuildAId(data.builds[0].id);
            setBuildBId(data.builds[1].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBuilds();
  }, [scope]);

  // Fetch comparison when A and B are selected
  useEffect(() => {
    async function fetchComparison() {
      if (!buildAId || !buildBId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/compare?scope=${encodeURIComponent(scope)}&buildA=${encodeURIComponent(buildAId)}&buildB=${encodeURIComponent(buildBId)}`);
        const data = await res.json();
        if (!data.error) {
          setComparisonData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [scope, buildAId, buildBId]);

  return (
      <div className="max-w-6xl mx-auto mt-10 space-y-12 pb-24">
        
        {/* Header & Scope Selector */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-8">
          <div>
            <div className="text-[10px] font-mono text-purple-500 tracking-widest mb-2 uppercase">Division Decision Engine</div>
            <h1 className="text-5xl font-black font-mono text-white tracking-tight uppercase">
              Head-to-Head
            </h1>
          </div>
          <div className="flex gap-2">
            {["Global", "Legendary", "Raid", "Incursion", "Countdown"].map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-all ${
                  scope === s 
                    ? "border border-purple-500 bg-purple-900/20 text-white" 
                    : "border border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-gray-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-purple-950/10 border border-purple-900/30 p-6">
            <div className="text-[10px] font-mono text-purple-500 uppercase tracking-widest mb-3">Build A (Challenger)</div>
            <select 
              value={buildAId}
              onChange={(e) => setBuildAId(e.target.value)}
              className="w-full bg-black border border-purple-900/50 text-white p-4 font-mono text-sm uppercase focus:outline-none focus:border-purple-500"
            >
              {availableBuilds.map(b => (
                <option key={b.id} value={b.id}>
                  {b.gearset.displayName} {b.weapon.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-cyan-950/10 border border-cyan-900/30 p-6">
            <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-3">Build B (Defender)</div>
            <select 
              value={buildBId}
              onChange={(e) => setBuildBId(e.target.value)}
              className="w-full bg-black border border-cyan-900/50 text-white p-4 font-mono text-sm uppercase focus:outline-none focus:border-cyan-500"
            >
              {availableBuilds.map(b => (
                <option key={b.id} value={b.id}>
                  {b.gearset.displayName} {b.weapon.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
            <div className="text-xs font-mono text-purple-400 uppercase tracking-widest animate-pulse">
              Crunching Telemetry...
            </div>
          </div>
        )}

        {!loading && comparisonData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BuildComparisonVisualizer data={comparisonData} />
          </div>
        )}

      </div>
  );
}
