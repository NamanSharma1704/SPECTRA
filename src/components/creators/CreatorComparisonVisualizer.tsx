import { CreatorComparisonSnapshot } from "@/types/intelligence";
import { CreatorComparisonVerdict } from "./CreatorComparisonVerdict";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";

export function CreatorComparisonVisualizer({
  challenger,
  defender,
}: {
  challenger: CreatorComparisonSnapshot;
  defender: CreatorComparisonSnapshot;
}) {
  const radarData = [
    {
      metric: "Trust Score",
      A: challenger.trustScoreState?.status === "AVAILABLE" ? challenger.trustScoreState.score : 0,
      B: defender.trustScoreState?.status === "AVAILABLE" ? defender.trustScoreState.score : 0,
      fullMark: 100,
    },
    {
      metric: "Influence Score",
      A: Math.min(100, challenger.influenceScore), // normalized for visual
      B: Math.min(100, defender.influenceScore),
      fullMark: 100,
    },
    {
      metric: "Forecast Accuracy",
      A: challenger.forecastAccuracyState?.status === "AVAILABLE" ? challenger.forecastAccuracyState.accuracy : 0,
      B: defender.forecastAccuracyState?.status === "AVAILABLE" ? defender.forecastAccuracyState.accuracy : 0,
      fullMark: 100,
    },
    {
      metric: "Lead Time",
      A: challenger.leadTimeScoreState?.status === "AVAILABLE" ? challenger.leadTimeScoreState.score : 0,
      B: defender.leadTimeScoreState?.status === "AVAILABLE" ? defender.leadTimeScoreState.score : 0,
      fullMark: 100,
    },
    {
      metric: "Consensus",
      A: challenger.consensusParticipation,
      B: defender.consensusParticipation,
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-16">
      
      {/* Visualizer Row 1: Radar & Head-to-Head Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Radar */}
        <div className="h-[400px] glass-panel border border-primary/20 flex flex-col items-center justify-center p-4 relative">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50" />
          <div className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-2 z-10">Intelligence Radar</div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={challenger.name} dataKey="A" stroke="#ff6a00" strokeWidth={2} fill="#ff6a00" fillOpacity={0.3} />
              <Radar name={defender.name} dataKey="B" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', fontFamily: 'monospace', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Head-to-Head Bars */}
        <div className="space-y-6">
          <h3 className="text-sm font-sans font-bold text-primary/50 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary/50" />
            Direct Comparison
          </h3>
          
          <MetricBar 
            label="Trust Score" 
            valA={challenger.trustScoreState?.status === "AVAILABLE" ? challenger.trustScoreState.score : 0} 
            valB={defender.trustScoreState?.status === "AVAILABLE" ? defender.trustScoreState.score : 0} 
            displayA={challenger.trustScoreState?.status === "AVAILABLE" ? challenger.trustScoreState.score.toString() : "N/A"}
            displayB={defender.trustScoreState?.status === "AVAILABLE" ? defender.trustScoreState.score.toString() : "N/A"}
            max={100} 
          />
          <MetricBar 
            label="Influence Score" 
            valA={challenger.influenceScore} 
            valB={defender.influenceScore} 
            max={Math.max(challenger.influenceScore, defender.influenceScore, 100)} 
          />
          <MetricBar 
            label="Influence Efficiency" 
            valA={challenger.influenceEfficiency} 
            valB={defender.influenceEfficiency} 
            max={Math.max(challenger.influenceEfficiency, defender.influenceEfficiency, 10)} 
            suffix="/10"
          />
          <MetricBar 
            label="Lead Time Score" 
            valA={challenger.leadTimeScoreState?.status === "AVAILABLE" ? challenger.leadTimeScoreState.score : 0} 
            valB={defender.leadTimeScoreState?.status === "AVAILABLE" ? defender.leadTimeScoreState.score : 0} 
            displayA={challenger.leadTimeScoreState?.status === "AVAILABLE" ? challenger.leadTimeScoreState.score.toString() : "N/A"}
            displayB={defender.leadTimeScoreState?.status === "AVAILABLE" ? defender.leadTimeScoreState.score.toString() : "N/A"}
            max={100} 
          />
          <MetricBar 
            label="Forecast Accuracy" 
            valA={challenger.forecastAccuracyState?.status === "AVAILABLE" ? challenger.forecastAccuracyState.accuracy : 0} 
            valB={defender.forecastAccuracyState?.status === "AVAILABLE" ? defender.forecastAccuracyState.accuracy : 0} 
            displayA={challenger.forecastAccuracyState?.status === "AVAILABLE" ? challenger.forecastAccuracyState.accuracy.toString() : "N/A"}
            displayB={defender.forecastAccuracyState?.status === "AVAILABLE" ? defender.forecastAccuracyState.accuracy.toString() : "N/A"}
            max={100} 
            suffix="%"
          />
          <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">
              <span>Confidence Level</span>
            </div>
            <div className="flex justify-between text-xs font-sans font-bold">
              <span className="text-primary flex flex-col items-end">
                <span className="tracking-widest uppercase">{challenger.confidenceLevel} ({challenger.confidenceScore})</span>
                <span className="text-[9px] text-gray-500 font-normal tracking-wide mt-1">Based on {challenger.evidenceCount} evaluated forecasts</span>
              </span>
              <span className="text-cyan-400 flex flex-col items-start">
                <span className="tracking-widest uppercase">{defender.confidenceLevel} ({defender.confidenceScore})</span>
                <span className="text-[9px] text-gray-500 font-normal tracking-wide mt-1">Based on {defender.evidenceCount} evaluated forecasts</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Visualizer Row 2: Contribution Pipeline */}
      <div>
        <h3 className="text-xl font-heading font-bold text-white tracking-widest uppercase mb-6 drop-shadow-md">Contribution Pipeline</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Pipeline 
            name={challenger.name} 
            originations={challenger.originations} 
            validations={challenger.validations} 
            evolutions={challenger.evolutions} 
            color="bg-primary shadow-[0_0_8px_rgba(255,106,0,0.5)]"
          />
          <Pipeline 
            name={defender.name} 
            originations={defender.originations} 
            validations={defender.validations} 
            evolutions={defender.evolutions} 
            color="bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
          />
        </div>
      </div>

      {/* Visualizer Row 3: Verdict Engine */}
      <div className="pt-8 border-t border-white/10">
        <CreatorComparisonVerdict challenger={challenger} defender={defender} />
      </div>

    </div>
  );
}

function MetricBar({ label, valA, valB, max, suffix = "", displayA, displayB }: { label: string, valA: number, valB: number, max: number, suffix?: string, displayA?: string, displayB?: string }) {
  const pctA = Math.min(100, Math.max(0, (valA / max) * 100));
  const pctB = Math.min(100, Math.max(0, (valB / max) * 100));

  return (
    <div className="group">
      <div className="flex justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-1 group-hover:text-gray-300 transition-colors">
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-4">
        {/* A side (Primary) */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <span className="text-xs font-sans font-bold tracking-widest text-primary drop-shadow-[0_0_2px_rgba(255,106,0,0.5)]">{displayA !== undefined ? displayA : valA}{suffix}</span>
          <div className="h-2 bg-black/50 border border-white/5 w-32 relative flex justify-end overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary absolute right-0 top-0 bottom-0 shadow-[0_0_5px_rgba(255,106,0,0.8)]" 
            />
          </div>
        </div>
        <div className="text-[10px] text-gray-600 font-sans font-bold">VS</div>
        {/* B side (Accent) */}
        <div className="flex-1 flex items-center justify-start gap-3">
          <div className="h-2 bg-black/50 border border-white/5 w-32 relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-cyan-500 absolute left-0 top-0 bottom-0 shadow-[0_0_5px_rgba(6,182,212,0.8)]" 
            />
          </div>
          <span className="text-xs font-sans font-bold tracking-widest text-cyan-400 drop-shadow-[0_0_2px_rgba(6,182,212,0.5)]">{displayB !== undefined ? displayB : valB}{suffix}</span>
        </div>
      </div>
    </div>
  );
}

function Pipeline({ name, originations, validations, evolutions, color }: { name: string, originations: number, validations: number, evolutions: number, color: string }) {
  const total = originations + validations + evolutions || 1;
  const pO = (originations / total) * 100;
  const pV = (validations / total) * 100;
  const pE = (evolutions / total) * 100;

  return (
    <div className="glass-panel p-5 border border-white/5 hover:border-white/20 transition-colors">
      <div className="text-sm font-heading font-bold text-gray-300 tracking-widest uppercase mb-4">{name}</div>
      <div className="flex h-3 bg-black/50 rounded-sm overflow-hidden mb-4 border border-white/5">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pO}%` }} transition={{ duration: 0.8 }} className={`${color} opacity-100 border-r border-black/50`} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${pV}%` }} transition={{ duration: 0.8 }} className={`${color} opacity-60 border-r border-black/50`} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${pE}%` }} transition={{ duration: 0.8 }} className={`${color} opacity-30`} />
      </div>
      <div className="flex justify-between text-[10px] font-sans font-bold tracking-widest uppercase">
        <div className="flex flex-col gap-1 items-start">
          <span className="text-white drop-shadow-md text-sm">{originations}</span> <span className="text-gray-500">Originations</span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-white drop-shadow-md text-sm">{validations}</span> <span className="text-gray-500">Validations</span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-white drop-shadow-md text-sm">{evolutions}</span> <span className="text-gray-500">Evolutions</span>
        </div>
      </div>
    </div>
  );
}
