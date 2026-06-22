"use client";

interface DNANode {
  label: string;
  value: string;
  highlight?: boolean;
}

interface BuildDNAStrandProps {
  archetype: string | null;
  buildName: string;
  topActivities: { name: string; score: number }[];
}

const ARCHETYPE_DNA: Record<string, DNANode[]> = {
  DPS: [
    { label: "ROLE", value: "DAMAGE DEALER", highlight: true },
    { label: "CORE", value: "WEAPON DMG", highlight: true },
    { label: "CRITICAL", value: "CHC + CHD" },
    { label: "TALENT", value: "OPTIMIST / OVERFLOW" },
    { label: "GEAR", value: "6-PIECE SET" },
    { label: "SPEC", value: "GUNNER / SHARPSHOOTER" },
  ],
  SKILL: [
    { label: "ROLE", value: "SKILL OPERATOR", highlight: true },
    { label: "CORE", value: "SKILL POWER", highlight: true },
    { label: "DAMAGE", value: "SKILL DAMAGE" },
    { label: "HASTE", value: "SKILL HASTE" },
    { label: "GEAR", value: "FUTURE INITIATIVE" },
    { label: "SPEC", value: "TECHNICIAN" },
  ],
  TANK: [
    { label: "ROLE", value: "VANGUARD", highlight: true },
    { label: "CORE", value: "ARMOR", highlight: true },
    { label: "REPAIR", value: "ARMOR REGEN" },
    { label: "RESIST", value: "HAZARD PROTECTION" },
    { label: "GEAR", value: "VANGUARD / BULWARK" },
    { label: "SPEC", value: "FIREWALL" },
  ],
  SUPPORT: [
    { label: "ROLE", value: "SUPPORT", highlight: true },
    { label: "CORE", value: "SKILL POWER", highlight: true },
    { label: "HEALING", value: "REPAIR SKILLS" },
    { label: "UTILITY", value: "BUFF APPLICATION" },
    { label: "GEAR", value: "FUTURE INITIATIVE" },
    { label: "SPEC", value: "TECHNICIAN" },
  ],
  HYBRID: [
    { label: "ROLE", value: "ADAPTIVE", highlight: true },
    { label: "CORE", value: "BALANCED", highlight: true },
    { label: "PRIMARY", value: "WEAPON DMG" },
    { label: "SECONDARY", value: "SKILL DMG" },
    { label: "GEAR", value: "MIXED SETS" },
    { label: "SPEC", value: "GUNNER" },
  ],
};

export function BuildDNAStrand({ archetype, buildName, topActivities }: BuildDNAStrandProps) {
  const arch = archetype ?? "HYBRID";
  const nodes = ARCHETYPE_DNA[arch] ?? ARCHETYPE_DNA.HYBRID;

  // Add activity specialization nodes
  const activityNodes: DNANode[] = topActivities.slice(0, 2).map((a) => ({
    label: "SPEC",
    value: a.name.toUpperCase(),
    highlight: a.score >= 90,
  }));

  const allNodes = [...nodes, ...activityNodes];

  return (
    <div className="border border-gray-800 bg-black/40 p-6">
      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
        <span className="w-1 h-3 bg-primary inline-block" />
        Build DNA Sequence
      </div>

      <div className="relative">
        {/* Backbone line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Nodes */}
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
          {allNodes.map((node, i) => (
            <div key={i} className="flex flex-col items-center flex-shrink-0 relative">
              {/* Top label (alternating) */}
              <div className={`h-14 flex items-end pb-2 ${i % 2 === 0 ? "opacity-100" : "opacity-0"}`}>
                <div className="text-center px-2">
                  <div className="text-[8px] font-mono text-gray-600 tracking-widest">{node.label}</div>
                  <div className={`text-[10px] font-mono font-bold whitespace-nowrap ${node.highlight ? "text-primary" : "text-gray-300"}`}>
                    {node.value}
                  </div>
                </div>
              </div>

              {/* Strand connector */}
              <div className="flex flex-col items-center">
                {/* Top arm */}
                <div className={`w-px h-4 ${i % 2 === 0 ? "bg-primary/50" : "bg-gray-700"}`} />
                {/* Node dot */}
                <div className={`w-3 h-3 rounded-full border-2 z-10 ${
                  node.highlight
                    ? "border-primary bg-primary/30 shadow-[0_0_8px_rgba(255,106,0,0.6)]"
                    : "border-gray-600 bg-gray-900"
                }`} />
                {/* Bottom arm */}
                <div className={`w-px h-4 ${i % 2 !== 0 ? "bg-primary/50" : "bg-gray-700"}`} />
              </div>

              {/* Bottom label (alternating) */}
              <div className={`h-14 flex items-start pt-2 ${i % 2 !== 0 ? "opacity-100" : "opacity-0"}`}>
                <div className="text-center px-2">
                  <div className="text-[8px] font-mono text-gray-600 tracking-widest">{node.label}</div>
                  <div className={`text-[10px] font-mono font-bold whitespace-nowrap ${node.highlight ? "text-primary" : "text-gray-300"}`}>
                    {node.value}
                  </div>
                </div>
              </div>

              {/* Connector bar between nodes */}
              {i < allNodes.length - 1 && (
                <div className="absolute top-1/2 left-full w-6 h-px bg-gray-800 -translate-y-1/2 z-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
