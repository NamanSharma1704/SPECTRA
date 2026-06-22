import { Sidebar } from "./Sidebar";
import { HologramBackground } from "./HologramBackground";
import { RealtimeHUD } from "./RealtimeHUD";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0A0A0A] relative">
      <HologramBackground />
      
      {/* Desktop sidebar — hidden on mobile (Sidebar renders its own mobile bar) */}
      <Sidebar />
      <RealtimeHUD />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Scrollable page content */}
        <main className="flex-1">
          {/* Mobile top bar spacer — Sidebar renders a sticky h-14 bar on mobile */}
          <div className="md:hidden h-14" />
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full pb-24">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
