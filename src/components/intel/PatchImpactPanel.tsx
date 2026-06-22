import { ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";

interface MetricItem {
  slug: string;
  displayName: string;
  metaScore: number;
  delta: number;
  growthPercent: number;
}

interface PatchImpactData {
  mostIncreased: MetricItem[];
  mostDecreased: MetricItem[];
  fastestGrowing: MetricItem[];
}

export function PatchImpactPanel({ data }: { data: PatchImpactData }) {
  if (!data) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-yellow-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Patch Impact</h2>
      </div>

      <div className="space-y-6">
        {/* Fastest Growing */}
        {data.fastestGrowing?.length > 0 && (
          <div>
            <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-yellow-400" />
              Fastest Growing
            </div>
            <div className="space-y-2">
              {data.fastestGrowing.slice(0, 2).map((item) => (
                <div key={item.slug} className="flex justify-between items-center border border-yellow-900/30 bg-yellow-900/10 p-2">
                  <span className="text-sm font-bold font-mono text-white truncate">{item.displayName}</span>
                  <span className="text-xs font-mono text-yellow-400 font-bold flex items-center">
                    ↑ +{item.growthPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Increased */}
        {data.mostIncreased?.length > 0 && (
          <div>
            <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase">Most Increased</div>
            <div className="space-y-1">
              {data.mostIncreased.slice(0, 3).map((item) => (
                <div key={item.slug} className="flex justify-between items-center px-2 py-1 hover:bg-white/5">
                  <span className="text-xs font-mono text-gray-300 truncate">{item.displayName}</span>
                  <span className="text-xs font-mono text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> +{item.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Decreased */}
        {data.mostDecreased?.length > 0 && (
          <div>
            <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase">Most Decreased</div>
            <div className="space-y-1">
              {data.mostDecreased.slice(0, 3).map((item) => (
                <div key={item.slug} className="flex justify-between items-center px-2 py-1 hover:bg-white/5">
                  <span className="text-xs font-mono text-gray-500 truncate">{item.displayName}</span>
                  <span className="text-xs font-mono text-red-500 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" /> {item.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
