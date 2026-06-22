"use client";

import { useState, useEffect, useRef } from "react";
import { CreatorComparisonSnapshot } from "@/types/intelligence";
import { RefreshCw, ArrowRight } from "lucide-react";
import { CreatorComparisonVisualizer } from "@/components/creators/CreatorComparisonVisualizer";
import { gsap } from "gsap";
import { motion } from "framer-motion";

export default function CreatorComparePage() {
  const [creators, setCreators] = useState<CreatorComparisonSnapshot[]>([]);
  const [challengerId, setChallengerId] = useState<string>("");
  const [defenderId, setDefenderId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all creators (which now includes the snapshot data)
  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/creators`);
        const { data } = await res.json();
        if (data && data.length > 0) {
          // Sort by Trust Score desc for the initial dropdown order
          // Using IntelligenceState for sorting
          const sorted = data.sort((a: any, b: any) => {
            const aScore = a.trustScoreState?.status === "AVAILABLE" ? a.trustScoreState.score : -1;
            const bScore = b.trustScoreState?.status === "AVAILABLE" ? b.trustScoreState.score : -1;
            return bScore - aScore;
          });
          setCreators(sorted);
          if (sorted.length > 1) {
            setChallengerId(sorted[0].id);
            setDefenderId(sorted[1].id);
          }
        }
      } catch (e) {
        console.error("Failed to load creators:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current.querySelector('.compare-header'),
      { opacity: 0, y: -20, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
    );
  }, []);

  const challenger = creators.find((c) => c.creatorId === challengerId || (c as any).id === challengerId);
  const defender = creators.find((c) => c.creatorId === defenderId || (c as any).id === defenderId);

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto mt-6 space-y-12 pb-24">
      {/* Header */}
      <div className="compare-header flex justify-between items-end border-b border-primary/20 pb-8 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
        <div>
          <div className="text-[10px] font-sans font-bold text-primary tracking-[0.3em] mb-2 uppercase">Sprint 12 Intelligence Engine</div>
          <h1 className="text-4xl font-bold font-heading text-primary neon-text tracking-widest uppercase">
            Creator Comparison
          </h1>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black border border-white/10 items-center justify-center rounded-full z-10 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
          <ArrowRight className="w-4 h-4 text-gray-500" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel border-l-4 border-l-primary p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="text-[10px] font-sans font-bold text-primary uppercase tracking-[0.2em] mb-4">Creator A (Challenger)</div>
          <select 
            value={challengerId}
            onChange={(e) => setChallengerId(e.target.value)}
            className="w-full bg-black/50 border border-primary/30 text-white p-4 font-sans font-bold tracking-widest text-sm uppercase focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            {creators.map(c => (
              <option key={c.creatorId || (c as any).id} value={c.creatorId || (c as any).id}>
                {c.name} (Trust: {c.trustScoreState?.status === "AVAILABLE" ? c.trustScoreState.score : "N/A"} | Infl: {c.influenceScore})
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel border-r-4 border-r-cyan-500 p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="text-[10px] font-sans font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 text-right">Creator B (Defender)</div>
          <select 
            value={defenderId}
            onChange={(e) => setDefenderId(e.target.value)}
            dir="rtl"
            className="w-full bg-black/50 border border-cyan-500/30 text-white p-4 font-sans font-bold tracking-widest text-sm uppercase focus:outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer"
          >
            {creators.map(c => (
              <option key={c.creatorId || (c as any).id} value={c.creatorId || (c as any).id} dir="ltr">
                {c.name} (Trust: {c.trustScoreState?.status === "AVAILABLE" ? c.trustScoreState.score : "N/A"} | Infl: {c.influenceScore})
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {loading && (
        <div className="py-20 text-center glass-panel">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4 drop-shadow-[0_0_8px_rgba(255,106,0,0.8)]" />
          <div className="text-xs font-sans font-bold text-primary uppercase tracking-[0.3em] animate-pulse">
            Computing Intelligence Snapshots...
          </div>
        </div>
      )}

      {!loading && challenger && defender && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CreatorComparisonVisualizer challenger={challenger} defender={defender} />
        </motion.div>
      )}
    </div>
  );
}
