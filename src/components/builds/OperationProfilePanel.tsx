"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const CONTENT_GROUPS = [
  { label: "All Activities", value: "ALL" },
  { label: "Control Points", value: "CONTROL POINTS" },
  { label: "Legendary", value: "LEGENDARY STRONGHOLDS" },
  { label: "Countdown", value: "COUNTDOWN" },
  { label: "Incursion", value: "INCURSION: PARADISE LOST" },
  { label: "Dark Zone", value: "DARK ZONE" },
  { label: "Conflict", value: "PvP CONFLICT" }
];

const GROUP_SIZES = [
  { label: "Any", value: "ANY" },
  { label: "Solo Agent", value: "SOLO" },
  { label: "Duo", value: "DUO" },
  { label: "3 Agents", value: "TRIO" },
  { label: "Full Squad", value: "SQUAD" }
];

const PLAYSTYLES = [
  { label: "Any", value: "ANY" },
  { label: "DPS", value: "DPS" },
  { label: "Tank", value: "TANK" },
  { label: "Support", value: "SUPPORT" },
  { label: "Skill Build", value: "SKILL" },
  { label: "Hybrid", value: "HYBRID" }
];

const PRIORITIES = [
  { label: "Meta", value: "META" },
  { label: "Easy to Farm", value: "FARM" },
  { label: "Solo Friendly", value: "SOLO" },
  { label: "Group Optimized", value: "GROUP" },
  { label: "Speed Farm", value: "SPEED" },
  { label: "Survivability", value: "SURVIVE" }
];

export function OperationProfilePanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [content, setContent] = useState("ALL");
  const [group, setGroup] = useState("ANY");
  const [playstyle, setPlaystyle] = useState("ANY");
  const [priority, setPriority] = useState("META");

  useEffect(() => {
    setContent(searchParams.get("content") || "ALL");
    setGroup(searchParams.get("group") || "ANY");
    setPlaystyle(searchParams.get("playstyle") || "ANY");
    setPriority(searchParams.get("priority") || "META");
  }, [searchParams]);

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/builds?${params.toString()}`, { scroll: false });
  }

  const Chip = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all border ${
        active 
          ? "border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(255,106,0,0.4)]" 
          : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300 bg-black/40"
      }`}
    >
      {label}
    </button>
  );

  return (
    <aside className="lg:col-span-3 border border-primary/20 bg-[#090909] p-5 h-fit">
      <div className="flex items-center justify-between border-b border-primary/30 pb-3 mb-5">
        <h3 className="text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-primary inline-block animate-pulse" />
          Operation Profile
        </h3>
        <span className="text-[10px] text-primary/60 font-mono border border-primary/20 px-1">ACTIVE</span>
      </div>

      <div className="space-y-8">
        {/* Content Section */}
        <div>
          <label className="text-[11px] text-primary/60 mb-3 block font-bold uppercase tracking-widest">
            Target Content
          </label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_GROUPS.map((c) => (
              <Chip 
                key={c.value} 
                active={content === c.value} 
                label={c.label} 
                onClick={() => updateQuery("content", c.value)} 
              />
            ))}
          </div>
        </div>

        {/* Group Size Section */}
        <div>
          <label className="text-[11px] text-primary/60 mb-3 block font-bold uppercase tracking-widest">
            Group Size
          </label>
          <div className="flex flex-wrap gap-2">
            {GROUP_SIZES.map((c) => (
              <Chip 
                key={c.value} 
                active={group === c.value} 
                label={c.label} 
                onClick={() => updateQuery("group", c.value)} 
              />
            ))}
          </div>
        </div>

        {/* Playstyle Section */}
        <div>
          <label className="text-[11px] text-primary/60 mb-3 block font-bold uppercase tracking-widest">
            Playstyle
          </label>
          <div className="flex flex-wrap gap-2">
            {PLAYSTYLES.map((c) => (
              <Chip 
                key={c.value} 
                active={playstyle === c.value} 
                label={c.label} 
                onClick={() => updateQuery("playstyle", c.value)} 
              />
            ))}
          </div>
        </div>

        {/* Priority Section */}
        <div>
          <label className="text-[11px] text-primary/60 mb-3 block font-bold uppercase tracking-widest">
            Build Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((c) => (
              <Chip 
                key={c.value} 
                active={priority === c.value} 
                label={c.label} 
                onClick={() => updateQuery("priority", c.value)} 
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
