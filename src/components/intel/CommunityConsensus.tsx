import { CheckCircle2 } from "lucide-react";

interface CommunityConsensusProps {
  confidenceLabel: string;
  creators: string[];
}

export function CommunityConsensus({ confidenceLabel, creators }: CommunityConsensusProps) {
  if (!creators || creators.length === 0) return null;

  return (
    <div className="border border-green-900/30 bg-green-950/10 p-5 mt-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-green-500 inline-block" />
        <h2 className="text-sm font-mono font-bold text-gray-300 tracking-widest uppercase">Community Consensus</h2>
      </div>

      <div className="mb-4 text-sm font-mono flex items-center gap-2">
        <span className="text-gray-500">Strength:</span>
        <span className={`font-bold ${confidenceLabel === "High" ? "text-green-400" : confidenceLabel === "Medium" ? "text-yellow-400" : "text-gray-400"}`}>
          {confidenceLabel === "High" ? "Very Strong" : confidenceLabel}
        </span>
      </div>

      <div>
        <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Creators:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {creators.map((c) => (
            <div key={c} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-sm font-mono text-gray-300 truncate">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
