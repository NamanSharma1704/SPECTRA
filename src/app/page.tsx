"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { GalaxyCanvas } from "@/components/galaxy/GalaxyCanvas";

export default function BootSequence() {
  const router = useRouter();
  const [bootText, setBootText] = useState("ESTABLISHING UPLINK...");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [glitch, setGlitch] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Boot text sequence
    const sequence = [
      { t: 0, text: "UPLINK ESTABLISHED // SECURING CONNECTION" },
      { t: 600, text: "AUTHENTICATING AGENT CREDENTIALS..." },
      { t: 1200, text: "DECRYPTING SHD NETWORK CACHE..." },
      { t: 1800, text: "BYPASSING ROGUE PROTOCOLS..." },
      { t: 2400, text: "LOADING META FORECASTS & TACTICAL DATA..." },
      { t: 3000, text: "SYNCING WITH GLOBAL SERVER..." },
      { t: 3800, text: "SPECTRA OS V2.0 ONLINE // ACCESS GRANTED" },
    ];

    sequence.forEach((stage) => {
      setTimeout(() => {
        setBootText(stage.text);
      }, stage.t);
    });

    // Rapid terminal logs simulation
    const logInterval = setInterval(() => {
      const hex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
      const process = ["SYS_INIT", "MEM_ALLOC", "NET_SYNC", "SEC_CHECK", "DATA_PARSE"][Math.floor(Math.random() * 5)];
      setLogs(prev => {
        const newLogs = [...prev, `[${process}] 0x${hex} ... OK`];
        if (newLogs.length > 10) newLogs.shift();
        return newLogs;
      });
    }, 150);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 2000);

    // Progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.floor(Math.random() * 4) + 1; // Random jumping progress
      });
    }, 80);

    // Redirect
    const timer = setTimeout(() => {
      router.push("/intel");
    }, 4500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      clearInterval(logInterval);
      clearInterval(glitchInterval);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] text-primary font-mono relative overflow-hidden flex items-center justify-center">
      
      {/* --- BACKGROUND EFFECTS --- */}
      
      {/* Animated 3D Galaxy Constellation Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <GalaxyCanvas />
      </div>
      
      {/* Tactical Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,106,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,106,0,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            backgroundPosition: "center center",
            animation: "pan-bg 20s linear infinite",
          }}
        />
        {/* Radar sweep line */}
        <div className="absolute top-1/2 left-1/2 w-[150vw] h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 origin-left animate-[spin_4s_linear_infinite] will-change-transform" />
      </div>

      {/* Subtle edge darkening instead of harsh black vignette */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* --- PERIPHERAL HUD ELEMENTS --- */}

      {/* Top Left: GPS & Data Stream */}
      <div className="absolute top-8 left-8 z-20 text-[10px] opacity-60 hidden md:block">
        <div className="mb-2 text-white/50">NODE: WDC-01 // SECTOR 4</div>
        <div className="flex gap-4">
          <div>LAT: 38.8951 N</div>
          <div>LON: 77.0364 W</div>
        </div>
        <div className="mt-4 border-l border-primary/30 pl-2">
          {logs.map((log, i) => (
            <div key={i} className="mb-1 opacity-70 animate-pulse">{log}</div>
          ))}
        </div>
      </div>

      {/* Top Right: System Status */}
      <div className="absolute top-8 right-8 z-20 text-xs text-right opacity-60 hidden md:block font-rajdhani font-semibold tracking-wider">
        <div className="flex justify-end gap-1 mb-1">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <div className="w-2 h-2 bg-primary" />
          <div className="w-2 h-2 bg-primary/20" />
        </div>
        <div>UPLINK: SECURE</div>
        <div>ENCRYPTION: AES-256</div>
      </div>

      {/* Bottom Left: Hex Grid Visualizer */}
      <div className="absolute bottom-8 left-8 z-20 opacity-30 flex gap-1 hidden md:flex">
        {mounted && [...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {[...Array(4)].map((_, j) => (
              <div 
                key={j} 
                className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-primary' : 'bg-primary/20'} transition-colors duration-500`}
                style={{ transitionDelay: `${Math.random() * 500}ms` }}
              />
            ))}
          </div>
        ))}
      </div>


      {/* --- MAIN CENTER CONSOLE --- */}
      
      <div className={`relative z-30 flex flex-col items-center max-w-xl w-full px-6 transition-all duration-75 ${glitch ? 'translate-x-1 -translate-y-1 opacity-80' : ''}`}>
        
        {/* Glitch overlay on logo */}
        <div className="relative mb-10">
          <AnimatedLogo className={`w-32 h-32 ${glitch ? 'blur-sm scale-105' : ''} transition-all`} />
          {glitch && (
            <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
          )}
        </div>
        
        <h1 className="text-white font-rajdhani font-bold text-5xl md:text-6xl tracking-[0.4em] uppercase mb-16 neon-text text-center">
          SPECTRA
        </h1>

        {/* Loading Interface */}
        <div className="w-full bg-black/30 border border-primary/30 p-6 relative isac-corner backdrop-blur-md shadow-[0_0_30px_rgba(255,106,0,0.1)] font-rajdhani">
          
          <div className="flex justify-between items-end mb-3">
            <div className="text-primary text-lg font-bold tracking-widest uppercase">
              {bootText}
            </div>
            <div className="text-white/60 text-xs font-mono">
              {progress}%
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-2 w-full bg-primary/10 flex gap-[2px]">
            {[...Array(20)].map((_, i) => {
              const isActive = progress >= (i + 1) * 5;
              return (
                <div 
                  key={i}
                  className={`h-full flex-1 transition-colors duration-75 ${isActive ? 'bg-primary shadow-[0_0_8px_rgba(255,106,0,1)]' : 'bg-transparent'}`}
                />
              );
            })}
          </div>

          {/* Footer Details */}
          <div className="flex justify-between items-center mt-4 text-[10px] tracking-widest text-primary/40">
            <div>SHD_OS // V.2.0.44</div>
            <div className="flex gap-2 items-center">
              <span className="w-1.5 h-1.5 bg-primary animate-ping rounded-full" />
              INTELLIGENCE AGGREGATOR
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pan-bg {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}} />
    </div>
  );
}
