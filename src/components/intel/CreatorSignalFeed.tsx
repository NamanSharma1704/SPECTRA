import { User, ExternalLink } from "lucide-react";

interface CreatorSignal {
  name: string;
  buildCount: number;
  topBuild: string;
  avgScore: number;
}

export function CreatorSignalFeed({ signals }: { signals: CreatorSignal[] }) {
  if (!signals || signals.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-purple-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Creator Signals</h2>
        <span className="ml-auto text-[10px] font-mono text-gray-700">{signals.length} ACTIVE SOURCES</span>
      </div>

      <div className="space-y-2">
        {signals.map((signal) => (
          <div
            key={signal.name}
            className="flex items-center gap-3 border border-gray-800 bg-black/20 px-4 py-3 hover:border-purple-500/30 hover:bg-purple-950/10 transition-all group"
          >
            {/* Avatar */}
            <div className="w-8 h-8 border border-gray-700 bg-gray-900 flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold text-primary">
              {signal.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-mono font-bold text-sm text-white">{signal.name}</div>
              <div className="text-[10px] font-mono text-gray-600 mt-0.5 truncate">
                SIGNAL: {signal.topBuild}
              </div>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-black font-mono text-primary">{Math.round(signal.avgScore)}</div>
              <div className="text-[9px] font-mono text-gray-600">AVG META</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
