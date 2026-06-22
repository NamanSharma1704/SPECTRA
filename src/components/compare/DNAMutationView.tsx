interface DNANode {
  trait: string;
  inA: boolean;
  inB: boolean;
  shared: boolean;
}

interface DNAMutationViewProps {
  dnaDiff: DNANode[];
  buildAName: string;
  buildBName: string;
  archetypeA: string;
  archetypeB: string;
}

export function DNAMutationView({
  dnaDiff,
  buildAName,
  buildBName,
  archetypeA,
  archetypeB,
}: DNAMutationViewProps) {
  const shared   = dnaDiff.filter((n) => n.shared);
  const onlyInA  = dnaDiff.filter((n) => n.inA && !n.inB);
  const onlyInB  = dnaDiff.filter((n) => n.inB && !n.inA);

  return (
    <div className="border border-gray-800 bg-black/40 p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-4 bg-primary inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          DNA Mutation Analysis
        </h2>
        <span className="ml-auto text-[10px] font-mono text-gray-700">
          {onlyInA.length + onlyInB.length} MUTATIONS · {shared.length} SHARED
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-[10px] font-mono">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-3 h-3 border border-cyan-400 bg-cyan-400/20 inline-block" />
          ALPHA ONLY
        </span>
        <span className="flex items-center gap-1.5 text-orange-400">
          <span className="w-3 h-3 border border-orange-400 bg-orange-400/20 inline-block" />
          BRAVO ONLY
        </span>
        <span className="flex items-center gap-1.5 text-gray-400">
          <span className="w-3 h-3 border border-gray-600 bg-gray-800 inline-block" />
          SHARED CORE
        </span>
      </div>

      {/* DNA Strand */}
      <div className="relative overflow-x-auto pb-4">
        {/* Top label row (A) */}
        <div className="flex items-end gap-0 mb-2 min-w-max">
          {dnaDiff.map((node, i) => (
            <div key={i} className={`w-24 px-1 text-center ${node.shared ? "opacity-0" : node.inA && !node.inB ? "" : "opacity-0"}`}>
              <div className="text-[8px] font-mono text-cyan-400 leading-tight">{node.trait}</div>
            </div>
          ))}
        </div>

        {/* The helix strand */}
        <div className="flex items-center gap-0 min-w-max">
          {dnaDiff.map((node, i) => {
            const color = node.shared
              ? { dot: "bg-gray-500 border-gray-400", line: "bg-gray-800", label: "text-gray-600" }
              : node.inA && !node.inB
              ? { dot: "bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]", line: "bg-cyan-900/30", label: "text-cyan-400" }
              : { dot: "bg-orange-400 border-orange-300 shadow-[0_0_8px_rgba(255,106,0,0.6)]", line: "bg-orange-900/30", label: "text-orange-400" };

            return (
              <div key={i} className="flex flex-col items-center w-24 relative group">
                {/* Top arm (A side — odd nodes) */}
                <div className={`w-px h-8 ${i % 2 === 0 ? (node.inA ? color.line : "bg-transparent") : "bg-transparent"}`} />

                {/* Node */}
                <div className={`w-4 h-4 rounded-full border-2 z-10 flex-shrink-0 ${color.dot}`} />

                {/* Bottom arm (B side — even nodes) */}
                <div className={`w-px h-8 ${i % 2 !== 0 ? (node.inB ? color.line : "bg-transparent") : "bg-transparent"}`} />

                {/* Tooltip on hover */}
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-1 z-20 bg-gray-900 border border-gray-700 px-2 py-1 text-[9px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className={color.label}>{node.trait}</div>
                  <div className="text-gray-600 mt-0.5">
                    {node.shared ? "SHARED" : node.inA && !node.inB ? "ALPHA ONLY" : "BRAVO ONLY"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom label row (B) */}
        <div className="flex items-start gap-0 mt-2 min-w-max">
          {dnaDiff.map((node, i) => (
            <div key={i} className={`w-24 px-1 text-center ${node.shared ? "opacity-0" : !node.inA && node.inB ? "" : "opacity-0"}`}>
              <div className="text-[8px] font-mono text-orange-400 leading-tight">{node.trait}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared backbone line */}
      <div className="mt-2 h-px bg-gradient-to-r from-cyan-500/30 via-gray-600/20 to-orange-500/30" />

      {/* Summary row */}
      <div className="flex items-center justify-between mt-4 text-[10px] font-mono">
        <div className="text-cyan-400">
          ALPHA: {archetypeA} · {onlyInA.map((n) => n.trait).join(", ") || "—"}
        </div>
        <div className="text-gray-600">{shared.length} SHARED TRAITS</div>
        <div className="text-orange-400 text-right">
          {onlyInB.map((n) => n.trait).join(", ") || "—"} · {archetypeB} :BRAVO
        </div>
      </div>
    </div>
  );
}
