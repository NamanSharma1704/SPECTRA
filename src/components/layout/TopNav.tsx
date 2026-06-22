import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNav() {
  return (
    <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 gap-4 border-b border-primary/20 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <div className="relative flex items-center group">
          <Search className="absolute left-3 w-4 h-4 text-primary/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="ACCESS DATABASE..."
            className="w-full h-9 sm:h-10 pl-9 bg-transparent border-primary/20 focus-visible:ring-1 focus-visible:ring-primary/50 font-mono text-primary placeholder:text-primary/30 uppercase tracking-widest text-xs"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <Button variant="ghost" size="icon" className="text-primary/50 hover:text-primary relative hover:bg-primary/10 rounded-none h-9 w-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_rgba(255,106,0,1)] animate-pulse" />
        </Button>

        <div className="h-8 w-[1px] bg-primary/20 hidden sm:block" />

        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-bold font-mono text-primary/80 group-hover:text-primary transition-all uppercase tracking-wider">Agent_001</div>
            <div className="text-[9px] text-primary/50 font-mono tracking-widest">SHD LEVEL: 4200</div>
          </div>
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 rounded-none border border-primary/30 group-hover:border-primary transition-colors shadow-[0_0_8px_rgba(255,106,0,0.2)]">
            <AvatarFallback className="bg-primary/10 text-primary font-mono font-bold rounded-none text-xs">AG</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
