"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  LayoutDashboard, Compass, Crosshair, Users, Activity,
  Settings, Radio, GitCompare, DatabaseZap, Home, Menu, X, Star, Target, Shield
} from "lucide-react";
import { AnimatedLogo } from "./AnimatedLogo";

const NAV_ITEMS = [
  { name: "Gearsets",           href: "/gearset",  icon: Shield },
  { name: "Intelligence",       href: "/intel",    icon: Radio },
  { name: "Meta Leaderboard",   href: "/meta",     icon: Crosshair },
  { name: "Meta Forecasts",     href: "/forecast", icon: Target },
  { name: "Accuracy Dashboard", href: "/forecasts/dashboard", icon: Target },
  { name: "Creators",           href: "/creators", icon: Users },
  { name: "Compare Creators",   href: "/creators/compare",  icon: GitCompare },
  { name: "Patch Intelligence", href: "/patch",    icon: Activity },
  { name: "Recommendations",    href: "/recommend",icon: Star },
  { name: "Ingestion Pipeline", href: "/ingest",   icon: DatabaseZap },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function NavLink({ item, active, onClick }: { item: typeof NAV_ITEMS[0]; active: boolean; onClick?: () => void }) {
  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={item.href}
        onClick={onClick}
        className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors duration-300 group overflow-hidden
          ${active
            ? "bg-primary/15 text-primary border border-primary/30"
            : "border border-transparent text-white/60 hover:text-white hover:bg-white/5 hover:border-white/10"
          }`}
      >
        {/* Active Scanline Effect */}
        {active && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_rgba(255,106,0,1)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Holographic background ping on active */}
        {active && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
        )}

        <item.icon className={`w-4 h-4 flex-shrink-0 relative z-10 transition-colors
          ${active ? "text-primary" : "text-white/40 group-hover:text-primary/80"}`} />
        
        <span className="font-sans font-medium tracking-wide truncate relative z-10 uppercase text-xs">
          {item.name}
        </span>
      </Link>
    </motion.div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/") return pathname === "/";

    const bestMatch = [...NAV_ITEMS]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(item.href + "/") || (item.href !== "/" && pathname.startsWith(item.href)));

    return bestMatch?.href === href;
  };

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden flex flex-shrink-0 items-center justify-between px-4 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3 text-primary neon-text font-bold text-lg uppercase tracking-widest font-heading">
          <AnimatedLogo className="w-6 h-6" />
          <span>SPECTRA</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/80 z-30 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-16 left-0 bottom-0 w-72 glass-panel border-l-0 rounded-l-none z-40 overflow-y-auto"
            >
              <nav className="flex flex-col gap-2 p-4">
                <div className="text-[10px] uppercase tracking-widest text-primary/50 mb-4 px-2 font-bold font-sans">
                  System Modules
                </div>
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {NAV_ITEMS.map((item) => (
                    <NavLink key={item.name} item={item} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
                  ))}
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <aside className="w-72 hidden md:flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 sticky top-4 flex-shrink-0 z-20">
        <div className="glass-panel border-white/5 flex-1 flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Cyberpunk Accent Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
            <div className="absolute top-[-1px] right-[-1px] w-0 h-0 border-t-[20px] border-l-[20px] border-t-primary border-l-transparent opacity-80" />
          </div>

          {/* Logo Section */}
          <div className="h-auto py-8 flex flex-col justify-center px-6 border-b border-white/5 relative flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 text-primary neon-text font-heading text-3xl tracking-widest relative z-10 hover:scale-[1.02] transition-transform">
              <AnimatedLogo className="w-8 h-8" />
              <span>SPECTRA</span>
            </Link>
            <div className="text-[10px] text-primary/60 font-sans mt-2 relative z-10 tracking-[0.2em] leading-relaxed uppercase font-bold">
              Strategic Performance Evaluation<br/>& Cluster Tracking Analytics
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-none">
            <div className="text-[10px] uppercase tracking-widest text-white/30 font-sans mb-4 px-2 font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Active Modules
            </div>
            
            <motion.nav 
              className="flex flex-col gap-1.5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </motion.nav>
          </div>

          {/* Footer Section */}
          <div className="h-20 flex-shrink-0 border-t border-white/5 px-6 flex items-center gap-4 bg-black/40">
             <div className="w-10 h-10 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center relative">
               <div className="absolute inset-0 rounded-full border border-primary/40 animate-[spin_4s_linear_infinite]" />
               <Radio className="w-5 h-5 text-primary" />
             </div>
             <div>
               <div className="text-xs font-bold text-white font-sans uppercase tracking-widest">SHD NETWORK</div>
               <div className="text-[9px] text-green-400 font-sans tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> ONLINE
               </div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
}
