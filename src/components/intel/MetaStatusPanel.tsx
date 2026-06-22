import { Activity, ShieldAlert, Zap, TrendingUp, AlertTriangle } from "lucide-react";

interface MetaStatusProps {
  confidence: number;
  consensusCount: number;
  lifecycle: string;
  color?: "purple" | "cyan";
}

export function MetaStatusPanel({ confidence, consensusCount, lifecycle, color = "purple" }: MetaStatusProps) {
  const colorClasses = color === "purple" 
    ? "border-purple-900/30 bg-purple-950/10 text-purple-500" 
    : "border-cyan-900/30 bg-cyan-950/10 text-cyan-500";

  const getRiskLabel = () => {
    if (lifecycle === "Declining" || lifecycle === "Dead Meta") return "High";
    if (confidence < 50) return "Medium";
    return "Low";
  };

  const getForecastLabel = () => {
    if (lifecycle === "Emerging Meta") return "Rising";
    if (lifecycle === "Declining") return "Falling";
    if (lifecycle === "Dead Meta") return "Terminal";
    return "Stable";
  };

  return (
    <div className={`border p-5 mt-6 mb-8 ${colorClasses.split(" ")[0]} ${colorClasses.split(" ")[1]}`}>
      <div className="flex items-center gap-2 mb-6">
        <Activity className={`w-4 h-4 ${colorClasses.split(" ")[2]}`} />
        <h2 className="text-sm font-mono font-bold text-gray-300 tracking-widest uppercase">Meta Status</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Lifecycle</div>
          <div className={`font-mono text-sm font-bold ${
            lifecycle === "Dead Meta" ? "text-red-500" :
            lifecycle === "Declining" ? "text-orange-500" :
            lifecycle === "Community Standard" || lifecycle === "Dominant Meta" ? "text-green-400" :
            "text-blue-400"
          }`}>
            {lifecycle.toUpperCase()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Confidence</div>
          <div className="font-mono text-sm font-bold text-white">{confidence} / 100</div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Consensus</div>
          <div className="font-mono text-sm font-bold text-white">{consensusCount} Creators</div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Forecast</div>
          <div className="font-mono text-sm font-bold text-white flex items-center gap-1">
            {getForecastLabel() === "Rising" && <TrendingUp className="w-3 h-3 text-green-400" />}
            {getForecastLabel()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Risk Level</div>
          <div className={`font-mono text-sm font-bold flex items-center gap-1 ${
            getRiskLabel() === "High" ? "text-red-500" :
            getRiskLabel() === "Medium" ? "text-yellow-500" :
            "text-green-500"
          }`}>
            {getRiskLabel() === "High" && <AlertTriangle className="w-3 h-3" />}
            {getRiskLabel()}
          </div>
        </div>
      </div>
    </div>
  );
}
