import { getForecastDashboardData } from "@/server/repositories/ForecastAccuracyRepository";
import { 
  Activity, ArrowUpRight, ArrowDownRight, TrendingUp, Target, 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Zap
} from "lucide-react";
import { ForecastDashboardClient } from "./ForecastDashboardClient";

export const dynamic = 'force-dynamic';

export default async function ForecastAccuracyDashboard() {
  const { stats, timeline, trustEvolution, ledger } = await getForecastDashboardData();
  
  return (
    <ForecastDashboardClient>
      
      {/* Header */}
      <div className="dashboard-header border-b border-primary/20 pb-6 relative mb-8">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
        <h1 className="text-4xl font-bold font-heading tracking-widest uppercase mb-2 flex items-center gap-4 text-primary neon-text">
          <Target className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,106,0,0.8)]" />
          Accuracy Dashboard
        </h1>
        <p className="text-xs text-primary/50 font-sans font-bold tracking-[0.2em] uppercase">
          Intelligence validation and calibration telemetry.
        </p>
      </div>

      {/* Forecast Resolution Statistics */}
      <section className="dashboard-panel glass-panel p-6 border-l-4 border-l-purple-500">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold font-heading uppercase tracking-widest text-white drop-shadow-md">
            Resolution Statistics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 glass-card glass-card-hover border-white/5">
            <div className="text-[10px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-1">Total Forecasts</div>
            <div className="text-3xl font-black font-heading text-white">{stats.total}</div>
            <div className="text-[10px] font-sans font-bold text-gray-500 mt-3 flex justify-between uppercase tracking-widest">
              <span>Resolved: <span className="text-primary">{stats.resolved}</span></span>
              <span>Pending: <span className="text-cyan-400">{stats.pending}</span></span>
            </div>
          </div>
          <div className="p-4 glass-card glass-card-hover border-emerald-500/20">
            <div className="text-[10px] font-sans font-bold text-emerald-500 tracking-widest uppercase mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Success
            </div>
            <div className="text-3xl font-black font-heading text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{stats.successRate}%</div>
            <div className="text-[10px] font-sans font-bold text-emerald-600/70 mt-3 tracking-widest uppercase">Strong growth signals</div>
          </div>
          <div className="p-4 glass-card glass-card-hover border-red-500/20">
            <div className="text-[10px] font-sans font-bold text-red-500 tracking-widest uppercase mb-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Failure
            </div>
            <div className="text-3xl font-black font-heading text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">{stats.failureRate}%</div>
            <div className="text-[10px] font-sans font-bold text-red-600/70 mt-3 tracking-widest uppercase">Dropped below thresholds</div>
          </div>
          <div className="p-4 glass-card glass-card-hover border-amber-500/20">
            <div className="text-[10px] font-sans font-bold text-amber-500 tracking-widest uppercase mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Partial / Expired
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black font-heading text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">{stats.partialRate}%</span>
              <span className="text-sm font-sans font-bold text-amber-600/70 mb-1">/ {stats.expiredRate}%</span>
            </div>
            <div className="text-[10px] font-sans font-bold text-amber-600/70 mt-3 tracking-widest uppercase">Mixed or stale signals</div>
          </div>
        </div>
      </section>

      {/* Timelines: Accuracy & Trust Evolution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="dashboard-panel glass-panel p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-heading uppercase tracking-widest text-white drop-shadow-md">
              Accuracy Timeline
            </h2>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 pt-4 border-b border-white/5 pb-2">
            {timeline.map((item: any, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end relative">
                <div className="w-full bg-emerald-500/20 rounded-t-sm relative group-hover:bg-emerald-500/50 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ height: `${Math.min(Math.max(item.accuracy, 2), 100)}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-sans font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded border border-emerald-500/30 whitespace-nowrap z-10">
                    {item.accuracy}%
                  </div>
                </div>
                <div className="text-[9px] text-gray-500 font-sans font-bold mt-3 uppercase tracking-widest rotate-[-45deg] origin-top-left absolute -bottom-8">
                  {item.month}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="dashboard-panel glass-panel p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold font-heading uppercase tracking-widest text-white drop-shadow-md">
              Trust Evolution
            </h2>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 pt-4 border-b border-white/5 pb-2">
            {trustEvolution.map((item: any, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end relative">
                <div className="w-full bg-orange-500/20 rounded-t-sm relative group-hover:bg-orange-500/50 transition-colors shadow-[0_0_10px_rgba(249,115,22,0.1)] group-hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]" style={{ height: `${Math.min(Math.max(item.trustScore, 2), 100)}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-sans font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded border border-orange-500/30 whitespace-nowrap z-10">
                    {item.trustScore}
                  </div>
                </div>
                <div className="text-[9px] text-gray-500 font-sans font-bold mt-3 uppercase tracking-widest rotate-[-45deg] origin-top-left absolute -bottom-8">
                  {item.month}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Forecast Ledger */}
      <section className="dashboard-panel glass-panel overflow-hidden mt-12 border-l-4 border-l-cyan-500">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
            <h2 className="text-xl font-bold font-heading uppercase tracking-widest text-white drop-shadow-md">
              Resolution Ledger
            </h2>
          </div>
          <div className="text-[10px] text-primary font-sans font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Live Feed
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {ledger.length > 0 ? ledger.map((item: any) => (
            <div key={item.id} className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center hover:bg-white/5 transition-colors group">
              <div className="w-48 flex-shrink-0">
                <div className="text-sm font-bold font-sans tracking-wider text-white mb-1 group-hover:text-primary transition-colors">{item.creator}</div>
                <div className="text-[9px] text-gray-500 font-sans font-bold uppercase tracking-widest">Creator</div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base font-bold font-heading tracking-widest text-cyan-400 uppercase">{item.entity}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-white/10 text-gray-300 uppercase tracking-widest border border-white/10">
                    {item.direction}
                  </span>
                  <span className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-widest">Conf: {item.confidence}%</span>
                </div>
                <div className="text-xs text-gray-400 font-sans leading-relaxed">
                  {item.reason}
                </div>
              </div>
              
              <div className="w-32 flex-shrink-0 flex flex-col md:items-end gap-2">
                <span className={`text-[10px] font-sans font-bold tracking-widest uppercase px-3 py-1.5 rounded ${
                  item.outcome === "SUCCESS" ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                  item.outcome === "FAILURE" ? "bg-red-900/40 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                  item.outcome === "PARTIAL" ? "bg-amber-900/40 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]" :
                  "bg-white/5 text-gray-400 border border-white/20"
                }`}>
                  {item.outcome}
                </span>
                <div className={`text-[10px] font-sans font-bold tracking-widest uppercase flex items-center gap-1 ${
                  item.delta.startsWith('+') ? "text-emerald-400" : 
                  item.delta.startsWith('-') ? "text-red-400" : "text-gray-500"
                }`}>
                  {item.delta.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : 
                   item.delta.startsWith('-') ? <ArrowDownRight className="w-3 h-3" /> : null}
                  Trust {item.delta}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-500 font-sans font-bold text-xs tracking-widest uppercase bg-black/20">
              NO FORECAST RESOLUTIONS FOUND IN DATABASE.
            </div>
          )}
        </div>
      </section>

    </ForecastDashboardClient>
  );
}
