import { Eye, Clock } from "lucide-react";

interface Adopter {
  id: string;
  name: string;
  isVerified: boolean;
  date: string;
}

interface EarlyAdoptersProps {
  adopters: Adopter[];
  daysToConsensus: number;
  color?: "purple" | "cyan";
}

export function EarlyAdoptersPanel({ adopters, daysToConsensus, color = "purple" }: EarlyAdoptersProps) {
  if (!adopters || adopters.length === 0) return null;

  const colorClasses = color === "purple" 
    ? "border-purple-900/30 bg-purple-950/10 text-purple-400" 
    : "border-cyan-900/30 bg-cyan-950/10 text-cyan-400";

  return (
    <div className={`border p-5 mb-8 ${colorClasses.split(" ")[0]} ${colorClasses.split(" ")[1]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className={`w-4 h-4 ${colorClasses.split(" ")[2]}`} />
          <h2 className="text-sm font-mono font-bold text-gray-300 tracking-widest uppercase">Early Adopters</h2>
        </div>
        {daysToConsensus > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            Consensus Formed {daysToConsensus} Days Later
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {adopters.map((adopter, i) => (
          <div key={adopter.id} className="flex items-center gap-3 bg-black/40 p-2 border border-gray-800/50">
            <div className={`font-mono text-xs font-bold opacity-50 ${colorClasses.split(" ")[2]}`}>#{i + 1}</div>
            <div>
              <div className="text-sm font-mono text-gray-200">{adopter.name}</div>
              <div className="text-[10px] font-mono text-gray-600">{new Date(adopter.date).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
