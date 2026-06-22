import { Badge } from "@/components/ui/badge";
import type { ForecastOutcome, MetaVelocity, TimelineEvent } from "@/types/timeline";
import { format, formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Crosshair,
  FileText,
  TrendingUp,
  XCircle,
} from "lucide-react";

const OUTCOME_STYLES: Record<ForecastOutcome, { color: string; panel: string }> = {
  SUCCESS: { color: "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]", panel: "bg-emerald-900/10 border-emerald-500/30" },
  FAILURE: { color: "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]", panel: "bg-red-900/10 border-red-500/30" },
  PARTIAL: { color: "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]", panel: "bg-amber-900/10 border-amber-500/30" },
  EXPIRED: { color: "text-gray-400 drop-shadow-[0_0_5px_rgba(156,163,175,0.8)]", panel: "bg-gray-900/30 border-gray-500/30" },
  UNRESOLVED: { color: "text-primary drop-shadow-[0_0_5px_rgba(255,106,0,0.8)]", panel: "bg-primary/5 border-primary/30" },
};

function ResolutionIcon({ outcome }: { outcome: ForecastOutcome }) {
  if (outcome === "SUCCESS") return <CheckCircle className="w-5 h-5" />;
  if (outcome === "FAILURE") return <XCircle className="w-5 h-5" />;
  if (outcome === "PARTIAL") return <AlertTriangle className="w-5 h-5" />;
  return <Clock className="w-5 h-5" />;
}

function directionColor(direction: string): string {
  if (["BUFF", "META", "EMERGING"].includes(direction)) return "text-emerald-400";
  if (["NERF", "OBSOLETE"].includes(direction)) return "text-red-500";
  return "text-primary";
}

function VelocityCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="glass-panel border-t-2 border-t-primary/50 p-5 transition-transform hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-gray-400 mb-2 drop-shadow-sm relative z-10">
        {label}
      </div>
      <div className="text-3xl font-heading text-primary font-black neon-text relative z-10">
        {value === null ? "-" : `${value}d`}
      </div>
    </div>
  );
}

export function IntelligenceFeed({ events, velocity }: { events: TimelineEvent[]; velocity: MetaVelocity }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <VelocityCard label="First Signal to Emerging" value={velocity.daysToEmerging} />
        <VelocityCard
          label="Emerging to Established"
          value={velocity.daysFromEmergingToEstablished}
        />
        <VelocityCard label="Emerging to Dominant" value={velocity.daysFromEmergingToDominant} />
      </div>

      <div className="relative border-l-2 border-primary/20 pl-8 ml-4 space-y-16 before:absolute before:top-0 before:-left-[2px] before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:via-cyan-500/50 before:to-transparent">
        {events.map((event) => (
          <div key={event.id} className="relative group">
            <div className="absolute -left-[41px] top-4 w-4 h-4 rounded-full bg-black border-2 border-primary group-hover:bg-primary transition-colors shadow-[0_0_10px_rgba(255,106,0,0.8)] z-10" />

            <div className="text-[10px] text-gray-500 font-sans font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-primary/50" />
              {format(new Date(event.timestamp), "MMM dd, yyyy")}
            </div>

            {event.type === "FORECAST" && (
              <div className="glass-panel border-l-4 border-l-primary p-6 relative overflow-hidden group-hover:border-primary/60 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-0 right-0 p-1.5 bg-primary/20 border-b border-l border-primary/30">
                  <Crosshair className="w-4 h-4 text-primary" />
                </div>

                <h3 className="text-xl font-heading font-black text-white mb-3 flex items-center gap-3 drop-shadow-md tracking-wide">
                  <span className="text-primary tracking-widest">FORECAST:</span> {event.metadata.creator}
                </h3>
                <p className="text-sm font-sans text-gray-300 mb-5 leading-relaxed tracking-wide">{event.description}</p>

                <div className="flex flex-wrap items-center gap-6 text-[10px] font-sans font-bold uppercase tracking-widest mb-5 bg-black/40 p-3 border border-white/10 w-fit shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">DIRECTION:</span>
                    <span className={directionColor(event.metadata.direction)}>
                      {event.metadata.direction}
                    </span>
                  </div>
                  <div className="w-px h-3 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">CONFIDENCE:</span> 
                    <span className="text-cyan-400 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]">{event.metadata.confidence}%</span>
                  </div>
                </div>

                {event.metadata.resolution ? (
                  <div className={`mt-5 p-5 border ${OUTCOME_STYLES[event.metadata.resolution.outcome].panel} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex justify-between items-center mb-4">
                      <div className="text-[10px] uppercase font-sans font-bold tracking-widest text-gray-400">
                        Resolution Outcome
                      </div>
                      <div className="text-[10px] uppercase font-sans font-bold tracking-widest text-primary/70 bg-primary/10 px-2 py-1 border border-primary/20">
                        {formatDistanceToNow(new Date(event.metadata.resolution.resolvedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                      <div className={`flex items-center gap-3 font-black font-heading text-2xl tracking-wider uppercase ${OUTCOME_STYLES[event.metadata.resolution.outcome].color}`}>
                        <ResolutionIcon outcome={event.metadata.resolution.outcome} />
                        {event.metadata.resolution.outcome}
                      </div>
                      <div className="flex-1 border-b border-dashed border-white/10" />
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-sans font-bold tracking-widest text-gray-500 mb-1">
                          Trust Delta
                        </div>
                        <div className="font-heading font-black text-3xl text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                          {event.metadata.resolution.trustDelta === null
                            ? "-"
                            : `${event.metadata.resolution.trustDelta > 0 ? "+" : ""}${event.metadata.resolution.trustDelta}`}
                        </div>
                      </div>
                    </div>
                    {event.metadata.resolution.reason && (
                      <p className="relative z-10 mt-4 pt-4 border-t border-white/10 text-xs font-sans text-gray-400 italic tracking-wide leading-relaxed">
                        {event.metadata.resolution.reason}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 p-4 border border-primary/20 bg-primary/5 flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-primary/70">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 animate-pulse text-primary" /> PENDING RESOLUTION
                    </div>
                  </div>
                )}
              </div>
            )}

            {event.type === "CONSENSUS" && (
              <div className="flex items-start gap-6 group-hover:translate-x-2 transition-transform bg-black/40 border border-white/5 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                <div className="bg-cyan-500/20 w-12 h-12 flex-shrink-0 flex items-center justify-center border border-cyan-500/50 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-1">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black font-heading text-cyan-400 tracking-wider uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm font-sans text-gray-300 mb-3 leading-relaxed tracking-wide">{event.description}</p>
                  <p className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest bg-white/5 inline-block px-2 py-1 border border-white/10">
                    Meta score <span className="text-white">{event.metadata.metaScore}</span> <span className="mx-2 text-white/20">|</span> Confidence <span className="text-white">{event.metadata.confidenceScore}%</span>
                  </p>
                </div>
              </div>
            )}

            {event.type === "PATCH" && (
              <div className="glass-panel border-l-4 border-l-purple-500 p-5 relative overflow-hidden group-hover:border-purple-400 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <Badge variant="outline" className="font-sans font-bold tracking-widest text-[10px] bg-purple-900/30 border-purple-500/50 text-purple-400 uppercase px-3 py-1">
                    <FileText className="w-3 h-3 mr-2" /> PATCH {event.metadata.version}
                  </Badge>
                  <span className={`text-[10px] font-sans font-bold tracking-[0.2em] uppercase ${directionColor(event.metadata.changeType)} px-2 py-1 bg-black/40 border border-white/5`}>
                    {event.metadata.changeType}
                  </span>
                </div>
                <p className="text-sm font-sans text-gray-300 leading-relaxed tracking-wide relative z-10">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
