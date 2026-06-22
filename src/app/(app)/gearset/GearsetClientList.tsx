"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Link from "next/link";
import { Crosshair, TrendingUp, History, Shield, ArrowRight } from "lucide-react";

interface Gearset {
  slug: string;
  canonical: string;
  type: string;
}

interface LiveData {
  stage?: string;
  meta_score?: number;
}

export function GearsetClientList({ gearsets, liveDataMap }: { gearsets: Gearset[], liveDataMap: Record<string, LiveData> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();
    
    // Header sequence
    tl.fromTo(containerRef.current.querySelector('.gearset-header'),
      { opacity: 0, y: -20, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
    );

    // Cards reveal
    tl.fromTo(cardsRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        stagger: 0.05, 
        duration: 0.5, 
        ease: "back.out(1.5)",
        clearProps: "all"
      },
      "-=0.2"
    );
  }, []);

  return (
    <div className="space-y-8" ref={containerRef}>
      <div className="gearset-header mb-8 border-b border-primary/20 pb-4 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
        <h1 className="text-4xl font-bold tracking-[0.2em] text-primary neon-text font-heading uppercase flex items-center gap-4">
          <Shield className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,106,0,0.8)]" />
          Gearsets Directory
        </h1>
        <p className="text-primary/50 mt-2 text-xs font-sans tracking-[0.3em] font-bold uppercase">
          Live Meta Database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gearsets.map((g, i) => {
          const liveData = liveDataMap[g.slug.toLowerCase()];
          
          return (
            <motion.div
              key={g.slug}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link 
                href={`/gearset/${g.slug}/timeline`} 
                ref={(el) => { cardsRef.current[i] = el; }}
                className="block group h-full"
              >
                <div className="glass-card glass-card-hover p-6 h-full flex flex-col relative overflow-hidden">
                  
                  {/* Scanline Effect on Hover */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
                  
                  {/* Accent Corner */}
                  <div className="absolute top-0 right-0 p-2 bg-primary/10 border-b border-l border-primary/20 z-10 transition-colors group-hover:bg-primary/30">
                    <Crosshair className="w-4 h-4 text-primary/70 group-hover:text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-heading font-bold text-white mb-4 uppercase tracking-widest group-hover:text-primary transition-colors pr-8 relative z-10 drop-shadow-md">
                    {g.canonical}
                  </h2>
                  
                  <div className="flex items-center justify-between mt-auto mb-6 text-sm font-sans pt-6 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Stage</span>
                      <span className={`font-bold tracking-wider ${liveData?.stage ? 'text-primary drop-shadow-[0_0_5px_rgba(255,106,0,0.5)]' : 'text-gray-600'}`}>
                        {liveData?.stage || "No Data"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end relative z-10">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Meta Score</span>
                      <span className={`font-bold font-heading text-xl flex items-center gap-1 ${liveData?.meta_score ? 'text-primary neon-text' : 'text-gray-600'}`}>
                        {liveData?.meta_score || "-"} <TrendingUp className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-gray-400 group-hover:text-primary transition-colors relative z-10">
                    <span className="text-[10px] font-bold font-sans uppercase tracking-[0.2em] flex items-center gap-2">
                      <History className="w-4 h-4" /> View Timeline
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
