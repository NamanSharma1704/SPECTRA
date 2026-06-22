interface ArchetypeEntry {
  archetype: string;
  count: number;
  avgScore: number;
}

const ARCHETYPE_COLORS: Record<string, string> = {
  DPS:     "bg-orange-500",
  SKILL:   "bg-purple-500",
  TANK:    "bg-blue-500",
  SUPPORT: "bg-green-500",
  HYBRID:  "bg-cyan-500",
  UNKNOWN: "bg-gray-600",
};

export function CreatorSpecializationChart({ archetypes }: { archetypes: ArchetypeEntry[] }) {
  const maxCount = Math.max(...archetypes.map((a) => a.count), 1);

  return (
    <div className="border border-gray-800 bg-black/40 p-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-4 bg-purple-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          Archetype Specialization
        </h2>
      </div>

      <div className="space-y-3">
        {archetypes.map((arch) => {
          const barColor = ARCHETYPE_COLORS[arch.archetype] ?? ARCHETYPE_COLORS.UNKNOWN;
          const width = (arch.count / maxCount) * 100;
          return (
            <div key={arch.archetype} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0 text-[11px] font-mono font-bold text-gray-300">
                {arch.archetype}
              </div>
              <div className="flex-1 h-6 bg-gray-900 relative overflow-hidden">
                <div
                  className={`h-full ${barColor} opacity-70 transition-all duration-700`}
                  style={{ width: `${width}%` }}
                />
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-[10px] font-mono text-white font-bold drop-shadow">
                    {arch.count} build{arch.count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="w-12 text-right text-[10px] font-mono text-gray-500 flex-shrink-0">
                {arch.avgScore} avg
              </div>
            </div>
          );
        })}
      </div>

      {archetypes.length === 0 && (
        <div className="text-center text-gray-700 text-xs font-mono py-4">NO DATA</div>
      )}
    </div>
  );
}
