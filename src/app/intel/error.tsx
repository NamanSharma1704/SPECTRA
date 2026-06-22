"use client";

export default function IntelError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono">
      <div className="text-center max-w-lg px-6">
        <div className="text-[10px] text-primary tracking-[0.3em] font-bold uppercase mb-4 animate-pulse">
          SHD_OS // SYSTEM ERROR // INTELLIGENCE FEED
        </div>
        <h1 className="text-4xl font-black font-heading text-primary neon-text tracking-widest uppercase mb-4">
          CONNECTION LOST
        </h1>
        <p className="text-gray-400 text-sm tracking-wider mb-2">
          Failed to retrieve intelligence briefing from the SHD network.
        </p>
        <p className="text-gray-600 text-xs tracking-wider mb-8 border border-white/5 bg-black/40 p-3">
          {error?.message ?? "An unknown server error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 border border-primary/50 text-primary text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary/10 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
