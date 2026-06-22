import { Check, Flame, Shield, Target, Zap, Clock, ShieldCheck } from "lucide-react";
import { RecommendationBuild } from "@/server/services/RecommendationService";
import { CommunityValidationWidget } from "@/components/intel/CommunityValidationWidget";

interface ExtendedBuild extends RecommendationBuild {
  recommendationScore: number;
  profileMatchScore?: number;
  title: string;
  reason: string;
}

export function RecommendationCard({ build, color = "purple", playstyle, groupSize, activity }: { build: ExtendedBuild, color?: "purple" | "cyan" | "green" | "orange" | "blue", playstyle?: string, groupSize?: string, activity?: string }) {
  const colorMap = {
    purple: "border-purple-900/30 bg-purple-950/10 text-purple-500",
    cyan: "border-cyan-900/30 bg-cyan-950/10 text-cyan-500",
    green: "border-green-900/30 bg-green-950/10 text-green-500",
    orange: "border-orange-900/30 bg-orange-950/10 text-orange-500",
    blue: "border-blue-900/30 bg-blue-950/10 text-blue-500",
  };

  const cClasses = colorMap[color];

  return (
    <div className={`border p-6 ${cClasses.split(" ")[0]} ${cClasses.split(" ")[1]}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className={`text-xs font-mono font-bold tracking-widest uppercase mb-1 ${cClasses.split(" ")[2]}`}>
            {build.title}
          </div>
          <h2 className="text-2xl font-black font-mono text-white tracking-tight uppercase">
            {build.gearset.displayName} {build.weapon.displayName}
          </h2>
        </div>
        <div className="text-right flex gap-4">
          {build.profileMatchScore !== undefined && (
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                Profile Match
              </div>
              <div className={`text-3xl font-black font-mono ${cClasses.split(" ")[2]}`}>
                {build.profileMatchScore}%
              </div>
            </div>
          )}
          <div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
              Rec Score
            </div>
            <div className={`text-3xl font-black font-mono ${cClasses.split(" ")[2]}`}>
              {build.recommendationScore}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-800 bg-black/50 p-5 mb-6">
        <h3 className="text-sm font-bold font-mono text-white tracking-widest uppercase mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> WHY?
        </h3>
        
        {build.profileMatchScore !== undefined && playstyle && groupSize && activity ? (
          <div className="mb-4 pb-4 border-b border-gray-800">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Based On:</div>
            <div className="space-y-2 text-sm font-mono text-gray-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> {playstyle} Preference
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> {groupSize} Preference
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> {activity} Activity
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm font-mono text-gray-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            <span className="font-bold text-white">{build.metaScore}</span> Meta Score
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            <span className="font-bold text-white">{build.confidence}</span> Confidence
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            <span className="font-bold text-white">{build.stability}</span> Stability
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            <span className="font-bold text-white">{build.consensus}</span> Consensus
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            Supported by <span className="font-bold text-white">{build.creators.length}</span> creators
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            Patch Stable
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            Created <span className="font-bold text-white">{build.daysOld}</span> days ago
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> 
            Last Verified <span className="font-bold text-white">{build.lastVerifiedDays === 0 ? "Today" : `${build.lastVerifiedDays} days ago`}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
          <span className="text-white font-bold">Primary Reason:</span> {build.reason}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
            Top Supporters
          </div>
          <div className="space-y-1">
            {build.creators.slice(0, 3).map((creator, i) => (
              <div key={i} className="text-sm font-mono text-gray-300">{creator}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
            Status
          </div>
          <div className={`text-sm font-bold font-mono tracking-wider uppercase ${
            build.lifecycle === "Dead Meta" ? "text-red-500" :
            build.lifecycle === "Declining" ? "text-orange-500" :
            build.lifecycle === "Community Standard" || build.lifecycle === "Dominant Meta" ? "text-green-400" :
            "text-blue-400"
          }`}>
            {build.lifecycle}
          </div>
        </div>
      </div>

      <CommunityValidationWidget targetId={build.id} targetType="build" />
    </div>
  );
}
