"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldAlert, Users, Radio, TriangleAlert } from "lucide-react";

export interface TickerEvent {
  id: string;
  type: "META" | "CONSENSUS" | "CREATOR" | "ISAC";
  title: string;
  description: string;
  metric?: string | number;
  timestamp: string;
  color: "primary" | "purple" | "emerald" | "rose" | "gray";
}

export function UnifiedLiveTicker({
  metaAlerts,
  consensusAlerts,
  creatorSignals,
}: {
  metaAlerts: any[];
  consensusAlerts: any[];
  creatorSignals: any[];
}) {
  const [events, setEvents] = useState<TickerEvent[]>([]);

  useEffect(() => {
    // Transform incoming aggregates into a unified feed
    const items: TickerEvent[] = [];

    metaAlerts.forEach((a, i) => {
      items.push({
        id: `meta-${a.id}-${i}`,
        type: "META",
        title: a.velocity === "RISING" ? "META SHIFT DETECTED" : "META UPDATE",
        description: `${a.creator}'s ${a.name} [${a.archetype}]`,
        metric: `SCORE: ${a.peakScore}`,
        timestamp: `${i * 2 + 1}m AGO`,
        color: a.velocity === "RISING" ? "primary" : "purple",
      });
    });

    consensusAlerts.forEach((c, i) => {
      if (c.confidenceScore > 75) {
        items.push({
          id: `cons-${c.slug}-${i}`,
          type: "CONSENSUS",
          title: "HIGH CONSENSUS REACHED",
          description: `Multiple creators validating ${c.slug.toUpperCase()}`,
          metric: `${Math.round(c.confidenceScore)}% CONF`,
          timestamp: `${i * 3 + 2}m AGO`,
          color: "emerald",
        });
      }
    });

    creatorSignals.forEach((c, i) => {
      items.push({
        id: `creat-${c.name}-${i}`,
        type: "CREATOR",
        title: "CREATOR SIGNAL",
        description: `${c.name} logged ${c.buildCount} new builds. Top: ${c.topBuild}`,
        metric: `AVG: ${Math.round(c.avgScore)}`,
        timestamp: `${i * 4 + 4}m AGO`,
        color: "gray",
      });
    });

    items.push({
      id: "isac-broadcast",
      type: "ISAC",
      title: "ISAC BROADCAST",
      description: "Striker-class builds continue to dominate endgame content. Monitor Heartbreaker variants.",
      metric: "HIGH PRIORITY",
      timestamp: "JUST NOW",
      color: "rose",
    });

    // Sort semi-randomly to simulate a live feed, but keep ISAC at top
    items.sort((a, b) => {
      if (a.type === "ISAC") return -1;
      if (b.type === "ISAC") return 1;
      return parseInt(a.timestamp) - parseInt(b.timestamp);
    });

    setEvents(items);
  }, [metaAlerts, consensusAlerts, creatorSignals]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary": return "border-[#FF6A00]/40 text-[#FF6A00] bg-[#FF6A00]/5";
      case "purple": return "border-purple-500/40 text-purple-400 bg-purple-500/5";
      case "emerald": return "border-emerald-500/40 text-emerald-400 bg-emerald-500/5";
      case "rose": return "border-rose-500/40 text-rose-400 bg-rose-500/5";
      default: return "border-gray-600/40 text-gray-300 bg-gray-800/20";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "META": return <Activity className="w-4 h-4" />;
      case "CONSENSUS": return <ShieldAlert className="w-4 h-4" />;
      case "CREATOR": return <Users className="w-4 h-4" />;
      case "ISAC": return <TriangleAlert className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl shadow-[inset_0_0_20px_rgba(255,106,0,0.02)] overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
        <h3 className="font-heading text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#FF6A00] animate-pulse" />
          Live Intelligence
        </h3>
        <span className="text-[10px] font-sans text-[#FF6A00] animate-pulse bg-[#FF6A00]/10 px-2 py-0.5 rounded">
          STREAM ACTIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-3 relative">
        <AnimatePresence>
          {events.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, x: -4 }}
              className={`p-3 border-l-2 rounded-r-lg transition-all duration-200 ${getColorClasses(ev.color)}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 text-[10px] font-sans font-bold tracking-widest uppercase">
                  {getIcon(ev.type)}
                  {ev.title}
                </div>
                <span className="text-[9px] font-sans opacity-60 tracking-wider">{ev.timestamp}</span>
              </div>
              <p className="text-xs font-sans text-white/80 mt-1 leading-relaxed">
                {ev.description}
              </p>
              {ev.metric && (
                <div className="mt-2 text-[10px] font-sans font-bold tracking-widest uppercase opacity-80">
                  [{ev.metric}]
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
