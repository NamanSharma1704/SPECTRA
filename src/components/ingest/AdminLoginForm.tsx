"use client";

import { useState } from "react";
import { loginAdmin } from "@/app/ingest/actions";
import { Lock, Loader2, AlertTriangle } from "lucide-react";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await loginAdmin(formData);
    if (!res.success) {
      setError(res.error || "Unknown error");
      setLoading(false);
    } else {
      // Refresh the page so the server component reads the new cookie
      window.location.reload();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass-panel p-8 max-w-md w-full relative overflow-hidden border border-primary/30 shadow-[0_0_30px_rgba(255,106,0,0.1)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 mb-4 shadow-[0_0_15px_rgba(255,106,0,0.2)]">
            <Lock className="w-8 h-8 text-primary drop-shadow-[0_0_5px_rgba(255,106,0,0.8)]" />
          </div>
          <h2 className="text-2xl font-heading font-black tracking-widest text-white uppercase">Restricted Area</h2>
          <p className="text-[10px] text-gray-400 font-sans tracking-[0.2em] uppercase mt-2 text-center">
            SHD_OS // PIPELINE_CONTROL // AUTH_REQUIRED
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-sans font-bold text-primary tracking-widest uppercase mb-2">
              Passphrase
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-black/60 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 p-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
                {error}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 hover:shadow-[0_0_15px_rgba(255,106,0,0.4)] transition-all font-sans font-bold tracking-[0.2em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}
