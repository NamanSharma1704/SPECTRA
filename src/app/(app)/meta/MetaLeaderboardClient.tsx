"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Crosshair, Shield, Zap, TrendingUp, Trophy, ChevronRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Build {
  id: string;
  rank: number;
  name: string;
  role: string;
  weapon: string;
  tier: string;
  score: string;
  trend: string;
}

export function MetaLeaderboardClient({ leaderboardData }: { leaderboardData: Build[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Tactical Boot Sequence with GSAP
    const tl = gsap.timeline();
    
    // Header flash
    tl.fromTo(containerRef.current.querySelector('.meta-header'), 
      { opacity: 0, x: -50, filter: "blur(10px)" },
      { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
    );

    // Overview box glitch entry
    tl.fromTo(containerRef.current.querySelector('.meta-overview'),
      { opacity: 0, scaleY: 0, transformOrigin: "top" },
      { opacity: 1, scaleY: 1, duration: 0.4, ease: "circ.out" },
      "-=0.2"
    );

    // Staggered row reveals (simulate data streaming in)
    tl.fromTo(rowsRef.current,
      { opacity: 0, x: 30, backgroundColor: "rgba(255, 106, 0, 0.5)" },
      { 
        opacity: 1, 
        x: 0, 
        backgroundColor: "rgba(255, 106, 0, 0.05)",
        stagger: 0.08, 
        duration: 0.5, 
        ease: "power2.out",
        clearProps: "all"
      },
      "-=0.1"
    );

  }, []);

  return (
    <div className="space-y-6" ref={containerRef}>
      
      <div className="meta-header flex items-center justify-between border-b border-primary/20 pb-4 mb-6 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_15px_rgba(255,106,0,1)] animate-pulse" />
        <div>
          <h1 className="text-4xl font-bold tracking-[0.2em] text-primary neon-text font-heading uppercase flex items-center gap-4">
            <Trophy className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,106,0,0.8)]" />
            GLOBAL META LEADERBOARD
          </h1>
          <p className="text-primary/50 mt-2 text-xs font-sans tracking-[0.3em] uppercase font-bold">
            Ranked by SHD Network Analytics
          </p>
        </div>
      </div>

      <div className="meta-overview glass-panel p-6 mb-8 relative overflow-hidden group border-l-4 border-l-primary">
        <div className="absolute top-0 right-0 p-2 bg-primary/10 border-b border-l border-primary/20">
             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
        </div>
        <div className="flex items-center gap-4 text-primary/80 font-sans font-bold text-xs tracking-widest uppercase mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span>Meta Overview // Year 8 Season 1</span>
        </div>
        <p className="text-gray-400 font-sans text-sm max-w-3xl leading-relaxed">
          The current environment heavily favors sustained DPS builds utilizing Exotic Assault Rifles. Skill builds remain viable for crowd control, but pure tank variations have seen a slight decline in high-tier content.
        </p>
      </div>

      <div className="space-y-3">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] text-gray-500 font-sans tracking-[0.2em] font-bold uppercase border-b border-white/5 bg-black/20 rounded-t-lg">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4">Configuration ID</div>
          <div className="col-span-2">Role Matrix</div>
          <div className="col-span-2">Primary Weapon</div>
          <div className="col-span-1 text-center">Tier</div>
          <div className="col-span-2 text-right">Meta Score</div>
        </div>

        {/* Leaderboard Rows */}
        {leaderboardData.map((build, i) => (
          <motion.div 
            key={build.id}
            whileHover={{ scale: 1.01, x: 10 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Link 
              href={`/gearset/${build.id}`} 
              ref={(el) => { rowsRef.current[i] = el; }}
              className="block"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 glass-card glass-card-hover cursor-pointer group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary transition-colors shadow-[0_0_15px_rgba(255,106,0,1)] opacity-0 group-hover:opacity-100"></div>
                
                {/* Scanline overlay on hover */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="col-span-1 text-center font-heading text-3xl font-bold text-gray-600 group-hover:text-primary transition-colors">
                  0{build.rank}
                </div>
                
                <div className="col-span-4 flex flex-col relative z-10">
                  <div className="font-bold text-white uppercase tracking-widest text-lg font-sans group-hover:text-primary transition-colors drop-shadow-md">
                    {build.name}
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center gap-2 text-xs text-gray-400 font-sans font-bold uppercase relative z-10">
                  <Crosshair className="w-3.5 h-3.5 text-primary/70" /> {build.role}
                </div>
                
                <div className="col-span-2 flex items-center gap-2 text-xs text-gray-400 font-sans font-bold uppercase relative z-10">
                  <Zap className="w-3.5 h-3.5 text-primary/70" /> {build.weapon}
                </div>
                
                <div className="col-span-1 text-center relative z-10">
                  <Badge variant="outline" className={`rounded-none font-sans font-bold tracking-[0.2em] border-primary/30 text-primary ${build.tier === 'S' ? 'bg-primary/20 shadow-[0_0_10px_rgba(255,106,0,0.5)]' : 'bg-black/40'}`}>
                    {build.tier}
                  </Badge>
                </div>
                
                <div className="col-span-2 flex items-center justify-between md:justify-end gap-4 relative z-10">
                  <div className="flex flex-col items-end">
                    <div className="font-heading text-3xl font-bold text-primary neon-text flex items-center gap-2">
                      {build.score}
                      {build.trend.startsWith('+') ? (
                        <TrendingUp className="w-5 h-5 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                      ) : build.trend.startsWith('-') ? (
                        <TrendingUp className="w-5 h-5 text-red-500 rotate-180 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-sans font-bold">Meta Score</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
