import { Clock, ShieldCheck, FileText, Users, Activity } from "lucide-react";

export function IntelligenceTimeline({ build }: { build: any }) {
  const rawSources = build?.build_sources || [];
  
  const events = rawSources.map((s: any) => ({
    date: new Date(s.published_at || new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    label: `${s.creator_name || 'System'} ${s.source_role === 'VALIDATION' ? 'Validation' : 'Origin'}`,
    icon: s.platform === 'YOUTUBE' ? <Activity className="w-3 h-3" /> : <FileText className="w-3 h-3" />,
    color: s.platform === 'YOUTUBE' ? "text-red-400" : s.platform === 'REDDIT' ? "text-orange-400" : "text-purple-400"
  }));

  return (
    <div className="border border-gray-800 bg-black/40 p-6 mt-6">
      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Intelligence Timeline
      </div>

      <div className="relative border-l border-gray-800 ml-3 space-y-6">
        {events.map((e: any, i: number) => (
          <div key={i} className="relative pl-6">
            <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-black border ${e.color} flex items-center justify-center`}>
              <div className={`w-1 h-1 rounded-full ${e.color.replace('text-', 'bg-')}`} />
            </div>
            <div className="text-[10px] font-mono text-gray-500 mb-1">{e.date}</div>
            <div className={`text-sm font-bold ${e.color} flex items-center gap-2`}>
              {e.icon}
              {e.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
