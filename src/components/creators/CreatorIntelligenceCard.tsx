"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronDown, ChevronUp, Activity, BrainCircuit, Target } from "lucide-react";

export interface CreatorIntelligenceProps {
  creator: {
    id: string;
    name: string;
    is_verified: boolean;
    trustState: any;
    trustTier: string;
    accuracyState: any;
    successfulCalls: number;
    leadTimeState: any;
    emergingCalls: number;
    accuracy90dState: any;
    accuracyLifetimeState: any;
    avgMetaScore: number;
    peakMetaScore: number;
    buildCount: number;
    omegaBuilds: number;
  };
  rank: number;
}

export function CreatorIntelligenceCard({ creator, rank }: CreatorIntelligenceProps) {
  const [expanded, setExpanded] = useState(false);

  const getArchetype = () => {
    // High Lead Time -> META DISCOVERER
    if (creator.leadTimeState?.status === "AVAILABLE" && creator.leadTimeState.leadTime >= 10 && creator.trustState?.status === "AVAILABLE" && creator.trustState.score >= 60) return "META DISCOVERER";
    // High Accuracy, Low Lead Time -> META VALIDATOR
    if (creator.accuracyState?.status === "AVAILABLE" && creator.accuracyState.accuracy >= 80 && creator.leadTimeState?.status === "AVAILABLE" && creator.leadTimeState.leadTime < 10) return "META VALIDATOR";
    // High Meta Impact / Large Build Count & High Meta -> META INFLUENCER
    if (creator.avgMetaScore >= 80 && creator.buildCount >= 5) return "META INFLUENCER";
    // Default
    return "SPECIALIST";
  };

  const archetype = getArchetype();

  const getTrend = () => {
    if (creator.accuracy90dState?.status === "AVAILABLE" && creator.accuracyLifetimeState?.status === "AVAILABLE") {
      const diff = creator.accuracy90dState.accuracy - creator.accuracyLifetimeState.accuracy;
      if (diff > 5) return { label: "Rising", symbol: "▲", color: "text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]", tooltip: `90-Day Accuracy: ${creator.accuracy90dState.accuracy}% vs Lifetime: ${creator.accuracyLifetimeState.accuracy}%` };
      if (diff < -5) return { label: "Falling", symbol: "▼", color: "text-red-500 drop-shadow-[0_0_2px_rgba(239,68,68,0.8)]", tooltip: `90-Day Accuracy: ${creator.accuracy90dState.accuracy}% vs Lifetime: ${creator.accuracyLifetimeState.accuracy}%` };
    }
    return { label: "Stable", symbol: "→", color: "text-gray-400", tooltip: "Stable" };
  };

  const trend = getTrend();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "ELITE": return "text-amber-400 border-amber-500/50 bg-amber-900/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
      case "HIGH": return "text-cyan-400 border-cyan-500/50 bg-cyan-900/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]";
      case "MEDIUM": return "text-gray-300 border-gray-600 bg-gray-900/50";
      default: return "text-red-400 border-red-500/50 bg-red-900/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
    }
  };

  return (
    <div className={`glass-panel border-l-4 transition-all overflow-hidden relative flex flex-col h-full group ${creator.trustTier === 'ELITE' ? 'border-l-amber-500 hover:border-l-amber-400' : 'border-l-primary/50 hover:border-l-primary'}`}>
      
      {/* Top Banner: Tier & Trend */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-white/5 bg-black/60 relative">
        <div className={`text-[10px] font-sans font-bold tracking-widest px-2 py-0.5 border uppercase ${getTierColor(creator.trustTier)}`}>
          {creator.trustTier}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-sans font-bold tracking-[0.2em] text-gray-500 uppercase">
            Trust Score
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black font-heading tracking-wider ${creator.trustTier === 'ELITE' ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'text-white'}`}>
              {creator.trustState?.status === "AVAILABLE" ? creator.trustState.score : "N/A"}
            </span>
            <span className={`text-sm ${trend.color}`} title={trend.tooltip}>
              {trend.symbol}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col relative z-10">
        {/* Creator Info */}
        <div className="flex justify-between items-start mb-8">
          <Link href={`/creators/${creator.id}`} className="flex items-center gap-4 group/link">
            <div className={`w-14 h-14 border ${creator.trustTier === 'ELITE' ? 'border-amber-500/50 bg-amber-900/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-white/10 bg-white/5 text-primary'} flex items-center justify-center font-heading text-3xl font-black transition-colors`}>
              {creator.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading font-black tracking-wider text-xl text-white group-hover/link:text-primary transition-colors drop-shadow-md">
                  {creator.name}
                </span>
                {creator.is_verified && <ShieldCheck className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />}
              </div>
              <div className="text-[10px] font-sans font-bold text-purple-400 tracking-[0.2em] uppercase border border-purple-500/30 bg-purple-900/20 px-2 py-0.5 inline-block shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                {archetype}
              </div>
            </div>
          </Link>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-sans font-bold tracking-[0.2em] uppercase mb-1">RANK</div>
            <div className="text-3xl font-black font-heading text-primary neon-text opacity-70 group-hover:opacity-100 transition-opacity">#{rank}</div>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/40 border border-white/5 p-3">
            <div className="text-[9px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-2 truncate">Meta Score</div>
            <div className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> {creator.peakMetaScore}
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-3">
            <div className="text-[9px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-2 truncate">Accuracy</div>
            <div className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /> {creator.accuracyState?.status === "AVAILABLE" ? `${creator.accuracyState.accuracy}%` : "N/A"}
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-3">
            <div className="text-[9px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-2 truncate">Lead Time</div>
            <div className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> {creator.leadTimeState?.status === "AVAILABLE" ? `${creator.leadTimeState.leadTime}d` : "N/A"}
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-3">
            <div className="text-[9px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-2 truncate">Predictions</div>
            <div className="font-heading font-black text-xl text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-orange-400" /> {creator.successfulCalls}
            </div>
          </div>
        </div>

        {/* Explainability Toggle */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="mt-auto w-full flex items-center justify-center gap-2 text-[10px] font-sans font-bold text-primary/60 hover:text-primary uppercase tracking-[0.2em] py-3 border-t border-white/10 transition-colors bg-black/20 hover:bg-black/40"
        >
          {expanded ? 'Hide Analysis' : 'Why This Rank?'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Explainability Expansion */}
        {expanded && (
          <div className="border-t border-primary/20 bg-primary/5 p-5 -mx-6 -mb-6 mt-4">
            <div className="text-[10px] font-sans font-bold text-primary/70 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Intelligence Breakdown
            </div>
            
            <div className="space-y-3 text-xs font-sans tracking-wide">
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]">✓</span>
                Accuracy: {creator.accuracyState?.status === "AVAILABLE" ? <span className="text-white font-bold">{creator.accuracyState.accuracy}%</span> : "INSUFFICIENT DATA"}
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]">✓</span>
                Lead Time: {creator.leadTimeState?.status === "AVAILABLE" ? <span className="text-white font-bold">{creator.leadTimeState.leadTime} Days</span> : "INSUFFICIENT DATA"}
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]">✓</span>
                <span className="text-white font-bold">{creator.successfulCalls}</span> Successful Calls
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]">✓</span>
                <span className="text-white font-bold">{creator.emergingCalls}</span> Emerging Metas Identified
              </div>
            </div>

            {/* Contextual Note about Archetype */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="text-[10px] text-gray-400 italic tracking-wider leading-relaxed font-sans">
                {archetype === "META DISCOVERER" && "Consistently identifies viable builds long before community consensus forms."}
                {archetype === "META VALIDATOR" && "Highly reliable source that successfully validates and optimizes emerging trends."}
                {archetype === "META INFLUENCER" && "Drives massive community adoption through highly resonant build showcases."}
                {archetype === "SPECIALIST" && "Maintains deep domain expertise in specific activity types."}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
