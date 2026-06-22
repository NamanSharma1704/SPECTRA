import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNav() {
  return (
    <header className="h-16 flex items-center justify-between px-6 gap-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30 flex-shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent shadow-[0_0_10px_rgba(255,106,0,0.5)]" />

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <div className="relative flex items-center group">
          <Search className="absolute left-4 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="ACCESS DATABASE..."
            className="w-full h-10 pl-11 bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 focus-visible:bg-black/50 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 font-mono text-white placeholder:text-white/30 uppercase tracking-widest text-xs transition-all rounded-lg"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button variant="ghost" size="icon" className="text-white/60 hover:text-primary relative hover:bg-primary/10 rounded-full h-10 w-10 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(255,106,0,1)] animate-pulse border border-black" />
        </Button>

        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-bold font-mono text-white/80 group-hover:text-primary transition-all uppercase tracking-wider">Agent_001</div>
            <div className="text-[9px] text-primary/60 font-mono tracking-widest">SHD LEVEL: 4200</div>
          </div>
          <Avatar className="h-10 w-10 rounded-lg border border-white/10 group-hover:border-primary transition-all shadow-[0_0_15px_rgba(255,106,0,0)] group-hover:shadow-[0_0_15px_rgba(255,106,0,0.3)] bg-gradient-to-br from-primary/20 to-black">
            <AvatarFallback className="bg-transparent text-primary font-mono font-bold rounded-lg text-sm">AG</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
