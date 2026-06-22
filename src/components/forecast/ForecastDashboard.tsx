"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ForecastCard } from "./ForecastCard";

export function ForecastDashboard({ initialForecasts }: { initialForecasts: any[] }) {
  const [activeTab, setActiveTab] = useState<"All" | "Builds" | "Skills" | "Items">("All");
  const containerRef = useRef<HTMLDivElement>(null);

  const filterMap: Record<string, string[]> = {
    "All": ["gearset", "exotic_weapon", "exotic_armor", "skill", "brand_set", "named_item"],
    "Builds": ["gearset"],
    "Skills": ["skill"],
    "Items": ["exotic_weapon", "exotic_armor", "brand_set", "named_item"],
  };

  const filteredForecasts = initialForecasts.filter(f => filterMap[activeTab].includes(f.domain_type));

  // Group by stage for layout
  const grouped = {
    "Dominant": filteredForecasts.filter(f => f.stage === "Dominant"),
    "Established": filteredForecasts.filter(f => f.stage === "Established"),
    "Emerging": filteredForecasts.filter(f => f.stage === "Emerging"),
    "Declining": filteredForecasts.filter(f => f.stage === "Declining"),
    "Dead": filteredForecasts.filter(f => f.stage === "Dead")
  };

  const tabs = ["All", "Builds", "Skills", "Items"] as const;

  // Entry GSAP Animation
  useEffect(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current.querySelector('.forecast-header'),
      { opacity: 0, y: -20, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
    );
  }, []);

  // Animate cards on tab change
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.forecast-card-wrapper');
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { opacity: 0, scale: 0.95, y: 10 },
        { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "back.out(1.2)" }
      );
    }
  }, [activeTab]);

  return (
    <div ref={containerRef} className="space-y-8 max-w-[1600px] mx-auto pt-6 pb-20">
      
      {/* Header */}
      <div className="forecast-header border-b border-primary/20 pb-5 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
        <div className="text-[10px] font-sans font-bold text-primary tracking-[0.3em] mb-2 uppercase">
          SHD_OS // INTELLIGENCE // META_FORECASTS
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-heading tracking-widest text-primary neon-text uppercase">Meta Forecasting</h1>
            <p className="text-primary/50 mt-2 text-xs font-sans font-bold tracking-[0.2em] uppercase">
              Predictive models based on {initialForecasts.length} consensus events.
            </p>
          </div>
          <div className="flex gap-2">
            {tabs.map(tab => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-none text-xs font-sans tracking-widest uppercase font-bold transition-all ${
                  activeTab === tab 
                    ? "bg-primary/20 text-white border border-primary shadow-[0_0_15px_rgba(255,106,0,0.3)]" 
                    : "glass-card glass-card-hover text-gray-500 hover:text-primary"
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Render each stage if it has forecasts */}
      <div className="space-y-12">
        {["Dominant", "Established", "Emerging", "Declining", "Dead"].map((stage) => {
          const items = grouped[stage as keyof typeof grouped];
          if (items.length === 0) return null;

          const stageColors: Record<string, string> = {
            "Dominant": "border-purple-500/30 text-purple-400 bg-purple-500/5",
            "Established": "border-cyan-500/30 text-cyan-400 bg-cyan-500/5",
            "Emerging": "border-primary/30 text-primary bg-primary/5",
            "Declining": "border-gray-500/30 text-gray-400 bg-gray-500/5",
            "Dead": "border-red-900/30 text-red-500 bg-red-900/5"
          };

          return (
            <div key={stage} className="space-y-4">
              <div className={`flex items-center gap-3 px-4 py-2 border ${stageColors[stage]} shadow-sm relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" />
                <h2 className="text-lg font-heading font-bold uppercase tracking-widest">{stage}</h2>
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-70 ml-2">
                  {items.length} Active {items.length === 1 ? 'Event' : 'Events'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(f => (
                  <motion.div 
                    key={f.id} 
                    className="forecast-card-wrapper h-full"
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ForecastCard forecast={f} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
