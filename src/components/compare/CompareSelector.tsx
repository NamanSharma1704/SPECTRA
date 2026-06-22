"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, ArrowLeftRight } from "lucide-react";

interface Build {
  id: string;
  name: string;
  archetype: string | null;
  creators: { name: string } | null;
}

export function CompareSelector({ builds }: { builds: Build[] }) {
  const router = useRouter();
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");

  function handleCompare() {
    if (aId && bId && aId !== bId) {
      router.push(`/compare?a=${aId}&b=${bId}`);
    }
  }

  const SelectBox = ({
    value,
    onChange,
    label,
    accentColor,
  }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    accentColor: string;
  }) => (
    <div className="flex-1 min-w-0">
      <div className={`text-[10px] font-mono tracking-widest mb-2 ${accentColor}`}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-gray-700 text-white font-mono text-sm px-3 py-3 focus:outline-none focus:border-primary/60 hover:border-gray-600 transition-colors appearance-none"
      >
        <option value="">— SELECT BUILD —</option>
        {builds.map((b) => (
          <option key={b.id} value={b.id}>
            [{b.archetype ?? "?"}] {b.name}
          </option>
        ))}
      </select>
      {value && (
        <div className="mt-1 text-[10px] font-mono text-gray-600 truncate">
          {builds.find((b) => b.id === value)?.creators?.name ?? ""}
        </div>
      )}
    </div>
  );

  const ready = aId && bId && aId !== bId;

  return (
    <div className="border border-gray-800 bg-black/40 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-4 bg-primary inline-block" />
        <span className="text-xs font-mono text-gray-400 tracking-widest uppercase">
          Select Two Builds to Compare
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
        <SelectBox value={aId} onChange={setAId} label="BUILD ALPHA" accentColor="text-cyan-400" />

        <div className="flex-shrink-0 flex items-end pb-3">
          <ArrowLeftRight className="w-5 h-5 text-gray-600" />
        </div>

        <SelectBox value={bId} onChange={setBId} label="BUILD BRAVO" accentColor="text-orange-400" />

        <button
          onClick={handleCompare}
          disabled={!ready}
          className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest transition-all
            ${ready
              ? "bg-primary text-black hover:bg-white cursor-pointer shadow-[0_0_20px_rgba(255,106,0,0.3)]"
              : "bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800"
            }`}
        >
          <Crosshair className="w-4 h-4" />
          Analyse
        </button>
      </div>

      {aId && bId && aId === bId && (
        <div className="mt-2 text-[10px] font-mono text-red-500">
          SELECT TWO DIFFERENT BUILDS
        </div>
      )}
    </div>
  );
}
