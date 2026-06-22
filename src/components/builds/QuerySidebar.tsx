"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const ACTIVITY_LIST = [
  "INCURSION: PARADISE LOST", 
  "LEGENDARY STRONGHOLDS", 
  "RAID: IRON HORSE", 
  "PvP CONFLICT"
];

const THREAT_LEVELS = ["GAMMA", "ALPHA", "OMEGA"];

export function QuerySidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activities, setActivities] = useState<string[]>([]);
  const [threat, setThreat] = useState(0);

  useEffect(() => {
    const qActivities = searchParams.get("activities");
    if (qActivities) {
      setActivities(qActivities.split(","));
    } else {
      setActivities(["INCURSION: PARADISE LOST", "LEGENDARY STRONGHOLDS"]);
    }
    const qThreat = searchParams.get("threat");
    if (qThreat) {
      setThreat(Math.max(0, THREAT_LEVELS.indexOf(qThreat)));
    }
  }, [searchParams]);

  function toggleActivity(a: string) {
    setActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  function executeQuery() {
    const params = new URLSearchParams();
    if (activities.length > 0) params.set("activities", activities.join(","));
    params.set("threat", THREAT_LEVELS[threat]);
    router.push(`/builds?${params.toString()}`);
  }

  return (
    <aside className="lg:col-span-3 border border-primary/20 bg-[#090909] p-4 sm:p-5 h-fit">
      <div className="flex items-center justify-between border-b border-primary/30 pb-3 mb-5">
        <h3 className="text-primary font-bold uppercase tracking-widest text-sm">Query Parameters</h3>
        <span className="text-[10px] bg-primary/20 text-primary px-1">v2.0.4</span>
      </div>

      <div className="mb-6">
        <label className="text-xs text-primary/60 mb-3 block font-bold uppercase tracking-wider">Activity Target</label>
        <div className="flex flex-col gap-3">
          {ACTIVITY_LIST.map((item) => (
            <label key={item} className="flex items-center gap-3 text-xs text-primary/80 hover:text-primary cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-primary w-4 h-4" 
                checked={activities.includes(item)}
                onChange={() => toggleActivity(item)}
              /> 
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs text-primary/60 mb-3 block font-bold uppercase tracking-wider">Threat Level Threshold</label>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="1"
          value={threat}
          onChange={(e) => setThreat(parseInt(e.target.value))}
          className="w-full accent-primary" 
        />
        <div className="flex justify-between text-[10px] text-primary/40 mt-1">
          <span className={threat === 0 ? "text-primary" : ""}>GAMMA</span>
          <span className={threat === 1 ? "text-primary" : ""}>ALPHA</span>
          <span className={threat === 2 ? "text-primary" : ""}>OMEGA</span>
        </div>
      </div>

      <button 
        onClick={executeQuery}
        className="w-full py-3 mt-4 bg-primary/10 border border-primary text-primary text-xs hover:bg-primary hover:text-black hover:shadow-[0_0_15px_rgba(255,106,0,0.5)] transition-all uppercase tracking-widest font-bold"
      >
        Execute Query
      </button>
    </aside>
  );
}
