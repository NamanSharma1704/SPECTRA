"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, DatabaseZap, X } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";

interface IntelligenceEvent {
  id: string;
  source: string;
  name: string;
  timestamp: number;
}

export function RealtimeHUD() {
  const [events, setEvents] = useState<IntelligenceEvent[]>([]);

  useEffect(() => {
    // Listen for high-value intelligence commitments
    const channel = supabaseClient
      .channel("intelligence_hud")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ingestion_staged_builds",
        },
        (payload) => {
          const oldRecord = payload.old as any;
          const newRecord = payload.new as any;
          
          // Only trigger if a pending build was just officially COMMITTED into the intelligence layer
          if (newRecord.status === "COMMITTED" && oldRecord.status !== "COMMITTED") {
            const newEvent: IntelligenceEvent = {
              id: newRecord.id,
              source: newRecord.source.toUpperCase(),
              name: newRecord.inferred_name || newRecord.raw_title,
              timestamp: Date.now(),
            };
            
            setEvents((prev) => [...prev, newEvent]);
            
            // Auto-dismiss after 8 seconds
            setTimeout(() => {
              setEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {events.map((evt) => (
          <motion.div
            key={`${evt.id}-${evt.timestamp}`}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="w-80 glass-panel border-l-4 border-l-emerald-500 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-sans font-bold text-[10px] tracking-widest uppercase">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Intelligence Acquired
              </div>
              <button 
                onClick={() => setEvents(events.filter(e => e.id !== evt.id))}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-white font-bold font-sans text-sm truncate drop-shadow-md">
              {evt.name}
            </p>
            <div className="flex justify-between items-center mt-3">
              <div className="text-[9px] font-sans text-gray-400 uppercase tracking-widest">
                Source: <span className="text-gray-200">{evt.source}</span>
              </div>
              <DatabaseZap className="w-4 h-4 text-emerald-500/50" />
            </div>
            
            {/* Subtle sweep animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[sweep_2s_ease-in-out_infinite] pointer-events-none" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
