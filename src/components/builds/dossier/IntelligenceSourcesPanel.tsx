import { ShieldCheck, Calendar, Users, ExternalLink, Activity, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

export function IntelligenceSourcesPanel({ build, selectedSourceId }: { build: any; selectedSourceId?: string }) {
  const sources = build.build_sources || [];
  
  // Group sources
  const originators = sources.filter((s: any) => s.source_role?.toUpperCase() === 'ORIGIN' || (!s.source_role && s.creator_id === build.creator_id));
  const evolvers = sources.filter((s: any) => s.source_role?.toUpperCase() === 'EVOLUTION');
  // Validators are everything else
  const validators = sources.filter((s: any) => !originators.includes(s) && !evolvers.includes(s));

  const selectedSource = selectedSourceId ? sources.find((s: any) => s.id === selectedSourceId) : null;

  const renderSourceCard = (source: any) => {
    const isSelected = source.id === selectedSourceId;
    const roleStr = (source.source_role || "validation").toUpperCase();
    const role = roleStr === "ORIGIN" ? "ORIGINATOR" : (roleStr === "EVOLUTION" ? "EVOLVER" : "VALIDATOR");
    
    let roleColor = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (role === "ORIGINATOR") roleColor = "text-primary border-primary/30 bg-primary/10";
    if (role === "EVOLVER") roleColor = "text-blue-400 border-blue-400/30 bg-blue-400/10";

    const dateStr = new Date(source.published_at || build.created_at || Date.now()).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    
    // Derived values
    const consensusInfluence = sources.length > 5 ? "High" : sources.length > 2 ? "Medium" : "Low";

    return (
      <div key={source.id} className={`border p-4 transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,102,0,0.1)]' : 'border-gray-800 bg-black/20 hover:border-gray-600'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <div className="font-mono font-bold text-sm text-white truncate mb-1">
              {source.creator_name || "Unknown Creator"}
            </div>
            <div className="text-[10px] font-mono text-gray-500 truncate">
              {source.source_title || build.name}
            </div>
          </div>
          <div className={`px-2 py-0.5 text-[9px] font-mono font-bold border flex-shrink-0 ${roleColor}`}>
            [{role}]
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-gray-800/50">
          <div>
            <div className="text-[9px] font-mono text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> PUBLISHED
            </div>
            <div className="text-[10px] font-mono text-gray-300">
              {dateStr}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-gray-600 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> CONSENSUS
            </div>
            <div className="text-[10px] font-mono text-gray-300">
              {consensusInfluence}
            </div>
          </div>
          <div className="sm:col-span-2 flex items-end justify-end">
             <Link
                href={`/builds/${build.id}/sources/${source.id}`}
                className="text-[10px] font-mono border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                VIEW CONTRIBUTION
              </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Block Header */}
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <h2 className="text-xl text-primary font-black uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Evidence Network
        </h2>
        <div className="text-[10px] text-primary/60 font-mono border border-primary/20 px-2 py-1 uppercase">
          Classified Level: SHD_ORIGIN
        </div>
      </div>

      {selectedSource && (
        <div className="border border-primary bg-primary/5 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4 border-b border-primary/20 pb-3">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-widest">
              Viewing Contribution
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] font-mono text-gray-500 mb-1">Creator</div>
              <div className="font-mono font-bold text-white text-sm">{selectedSource.creator_name || "Unknown"}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-gray-500 mb-1">Role</div>
              <div className="font-mono font-bold text-white text-sm">
                {selectedSource.source_role?.toUpperCase() === 'ORIGIN' ? 'Originator' : 
                 selectedSource.source_role?.toUpperCase() === 'EVOLUTION' ? 'Evolver' : 'Validator'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-gray-500 mb-1">Contribution Date</div>
              <div className="font-mono font-bold text-white text-sm">
                {new Date(selectedSource.published_at || Date.now()).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-gray-500 mb-1">Forecast Outcome</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">
                 {(selectedSource.confidence_score || 0) > 60 ? "Successful" : "Pending"}
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-primary/10 flex justify-between items-center">
            <div className="font-mono text-sm text-gray-300">
              <span className="text-gray-500 mr-2">Video:</span>
              {selectedSource.source_title || build.name}
            </div>
            <a href={selectedSource.source_url} target="_blank" rel="noreferrer" className="text-[10px] font-mono border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-black transition-all">
              WATCH SOURCE
            </a>
          </div>
        </div>
      )}

      <div className="space-y-8">
        
        {originators.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Originators ({originators.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {originators.map(renderSourceCard)}
            </div>
          </div>
        )}

        {validators.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Validators ({validators.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {validators.map(renderSourceCard)}
            </div>
          </div>
        )}

        {evolvers.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Evolvers ({evolvers.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {evolvers.map(renderSourceCard)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
