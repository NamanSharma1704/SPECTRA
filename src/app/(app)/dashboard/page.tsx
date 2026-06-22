import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Crosshair, Flame, Shield, TrendingUp, Zap } from "lucide-react";

export default function CommandCenter() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4 mb-6 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_8px_rgba(255,106,0,1)]" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-primary neon-text font-mono uppercase">COMMAND CENTER</h1>
          <p className="text-primary/50 mt-1 text-xs font-mono tracking-widest uppercase">System Status: Nominal // Last Sync: 2 Mins Ago</p>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 rounded-none isac-corner font-mono tracking-widest px-3 py-1">
          <Activity className="w-3 h-3 mr-2 animate-pulse text-primary shadow-[0_0_5px_rgba(255,106,0,1)]" />
          LIVE
        </Badge>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 isac-corner neon-box border-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1 bg-primary/20 border-b border-l border-primary/30">
             <div className="w-2 h-2 bg-primary animate-pulse" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-primary/70 uppercase font-mono tracking-widest">Active Builds Analyzed</CardTitle>
            <Crosshair className="h-4 w-4 text-primary group-hover:drop-shadow-[0_0_5px_rgba(255,106,0,1)] transition-all" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary neon-text">14,293</div>
            <p className="text-xs text-primary/80 mt-1 flex items-center font-mono">
              <TrendingUp className="w-3 h-3 mr-1" /> +12% from last patch
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel isac-corner border-primary/20 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-primary/70 uppercase font-mono tracking-widest">Top Weapon</CardTitle>
            <Zap className="h-4 w-4 text-primary group-hover:drop-shadow-[0_0_5px_rgba(255,106,0,1)] transition-all" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground font-mono uppercase tracking-wider">St. Elmo's Engine</div>
            <p className="text-xs text-primary/50 mt-1 font-mono uppercase">Found in 42% of AR Builds</p>
          </CardContent>
        </Card>

        <Card className="glass-panel isac-corner border-primary/20 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-primary/70 uppercase font-mono tracking-widest">Top Gear Set</CardTitle>
            <Shield className="h-4 w-4 text-primary group-hover:drop-shadow-[0_0_5px_rgba(255,106,0,1)] transition-all" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground font-mono uppercase tracking-wider">Striker's Battlegear</div>
            <p className="text-xs text-primary/50 mt-1 font-mono uppercase">Found in 68% of DPS Builds</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meta Leaderboard */}
        <Card className="col-span-2 glass-panel isac-corner border-primary/20">
          <CardHeader className="border-b border-primary/10 pb-4 mb-4">
            <CardTitle className="text-xl flex items-center gap-2 font-mono text-primary uppercase tracking-widest">
              <Flame className="w-5 h-5 text-primary" />
              CURRENT META LEADERBOARD
            </CardTitle>
            <CardDescription className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">Top performing builds across all activities (Patch Y8S1)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { rank: 1, name: "Striker Elmo DPS", role: "DPS", score: 98 },
                { rank: 2, name: "Heartbreaker Bruiser", role: "Hybrid", score: 92 },
                { rank: 3, name: "Eclipse Protocol CC", role: "Skill", score: 89 },
                { rank: 4, name: "Foundry Bulwark Tank", role: "Tank", score: 85 },
              ].map((build) => (
                <div key={build.name} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer group isac-corner relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary transition-colors"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-mono text-xl font-bold text-primary/50 group-hover:text-primary transition-colors">
                      0{build.rank}
                    </div>
                    <div>
                      <div className="font-bold text-foreground uppercase tracking-widest text-sm font-mono">{build.name}</div>
                      <div className="text-[10px] text-primary/60 uppercase tracking-widest font-mono">{build.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold text-primary neon-text">{build.score}</div>
                      <div className="text-[8px] text-primary/50 uppercase tracking-widest font-mono">Meta Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Meta Shifts */}
        <Card className="glass-panel isac-corner border-primary/20">
          <CardHeader className="border-b border-primary/10 pb-4 mb-4">
            <CardTitle className="text-lg font-mono text-primary uppercase tracking-widest">META SHIFTS</CardTitle>
            <CardDescription className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">Recent trend velocity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono uppercase tracking-widest">
                  <span className="font-medium text-green-500 shadow-green-500/50 drop-shadow-md">Rising: Hotshot Sniper</span>
                  <span className="font-bold text-green-500">+15%</span>
                </div>
                <div className="h-2 w-full bg-primary/10 overflow-hidden isac-corner border border-primary/20 p-[1px]">
                  <div className="h-full bg-green-500 w-[75%] isac-corner shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="flex justify-between text-xs font-mono uppercase tracking-widest">
                  <span className="font-medium text-red-500 shadow-red-500/50 drop-shadow-md">Falling: Rigger Drone</span>
                  <span className="font-bold text-red-500">-8%</span>
                </div>
                <div className="h-2 w-full bg-primary/10 overflow-hidden isac-corner border border-primary/20 p-[1px]">
                  <div className="h-full bg-red-500 w-[40%] isac-corner shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
