"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { CreatorIntelligenceCard } from "./CreatorIntelligenceCard";

export function CreatorDashboard({ initialCreators, consensusCount }: { initialCreators: any[], consensusCount: number }) {
  const [sortBy, setSortBy] = useState<"trust" | "meta" | "accuracy" | "lead">("trust");
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedCreators = useMemo(() => {
    return [...initialCreators].sort((a, b) => {
      switch (sortBy) {
        case "trust": {
          const aScore = a.trustState?.status === "AVAILABLE" ? a.trustState.score : -1;
          const bScore = b.trustState?.status === "AVAILABLE" ? b.trustState.score : -1;
          return bScore - aScore;
        }
        case "meta":
          return b.peakMetaScore - a.peakMetaScore;
        case "accuracy": {
          const aAcc = a.accuracyState?.status === "AVAILABLE" ? a.accuracyState.accuracy : -1;
          const bAcc = b.accuracyState?.status === "AVAILABLE" ? b.accuracyState.accuracy : -1;
          return bAcc - aAcc;
        }
        case "lead": {
          const aLead = a.leadTimeState?.status === "AVAILABLE" ? a.leadTimeState.leadTime : -1;
          const bLead = b.leadTimeState?.status === "AVAILABLE" ? b.leadTimeState.leadTime : -1;
          return bLead - aLead; // Higher lead time is better
        }
        default:
          return 0;
      }
    });
  }, [initialCreators, sortBy]);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current.querySelector('.creator-header'),
      { opacity: 0, y: -20, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
    );
  }, []);

  // Stagger cards on sort change or load
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.creator-card-wrapper');
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "back.out(1.2)" }
      );
    }
  }, [sortBy, sortedCreators.length]);

  return (
    <div ref={containerRef} className="space-y-6 max-w-[1600px] mx-auto pt-6 pb-20">
      {/* Header & Sort Toggle */}
      <div className="creator-header border-b border-primary/20 pb-5 mb-8 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
        <div className="text-[10px] text-primary tracking-[0.3em] font-sans font-bold mb-2 uppercase">
          SHD_OS // CREATOR_INTELLIGENCE // NETWORK_MAP
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-heading tracking-widest text-primary neon-text uppercase">Creator Intelligence</h1>
            <div className="flex gap-4 mt-3">
              <span className="text-orange-400 text-[10px] font-sans tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Verified Analysts: {initialCreators.length}
              </span>
              <span className="text-cyan-400 text-[10px] font-sans tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Consensus Events: {consensusCount}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] text-primary/50 font-sans tracking-[0.2em] font-bold uppercase">Sort By</div>
            <div className="flex items-center glass-panel p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy("trust")}
                className={`px-3 py-1.5 text-[10px] font-sans font-bold tracking-[0.1em] uppercase transition-colors ${sortBy === "trust" ? "bg-amber-900/40 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "text-gray-500 hover:text-amber-400 border border-transparent"}`}
              >
                Trust Score
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy("meta")}
                className={`px-3 py-1.5 text-[10px] font-sans font-bold tracking-[0.1em] uppercase transition-colors ${sortBy === "meta" ? "bg-purple-900/40 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "text-gray-500 hover:text-purple-400 border border-transparent"}`}
              >
                Meta Score
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy("accuracy")}
                className={`px-3 py-1.5 text-[10px] font-sans font-bold tracking-[0.1em] uppercase transition-colors ${sortBy === "accuracy" ? "bg-cyan-900/40 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]" : "text-gray-500 hover:text-cyan-400 border border-transparent"}`}
              >
                Accuracy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy("lead")}
                className={`px-3 py-1.5 text-[10px] font-sans font-bold tracking-[0.1em] uppercase transition-colors ${sortBy === "lead" ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "text-gray-500 hover:text-emerald-400 border border-transparent"}`}
              >
                Lead Time
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Grid */}
      {sortedCreators.length === 0 ? (
        <div className="glass-panel p-12 text-center font-sans font-bold tracking-[0.2em] text-gray-500 uppercase">
          NO CREATOR RECORDS FOUND
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCreators.map((creator, i) => (
            <motion.div 
              key={creator.id} 
              className="creator-card-wrapper h-full"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <CreatorIntelligenceCard creator={creator} rank={i + 1} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
