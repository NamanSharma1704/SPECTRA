import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface IngestionJob {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string | null;
  status: "RUNNING" | "COMPLETE" | "ERROR";
  stats: { scanned: number; extracted: number; staged: number; errors: number };
  errors: string[];
}

export function IngestionLog({ jobs }: { jobs: IngestionJob[] }) {
  if (jobs.length === 0) {
    return (
      <div className="border border-gray-800 bg-black/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 bg-gray-600 inline-block" />
          <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Ingestion Log</h2>
        </div>
        <div className="text-center py-6 text-gray-700 text-xs font-mono">NO JOBS RUN YET</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-800 bg-black/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-gray-600 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Ingestion Log</h2>
        <span className="ml-auto text-[10px] font-mono text-gray-700">{jobs.length} JOBS</span>
      </div>

      <div className="space-y-2">
        {jobs.map((job) => (
          <div key={job.id} className={`flex items-center gap-4 border px-4 py-3 text-[10px] font-mono ${
            job.status === "ERROR" ? "border-red-800/30 bg-red-950/10" :
            job.status === "RUNNING" ? "border-yellow-800/30 bg-yellow-950/10" :
            "border-gray-800 bg-black/20"
          }`}>
            {/* Status icon */}
            {job.status === "COMPLETE" && <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
            {job.status === "ERROR"    && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
            {job.status === "RUNNING"  && <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin flex-shrink-0" />}

            {/* Job ID */}
            <span className="text-gray-700 flex-shrink-0">#{job.id}</span>

            {/* Source */}
            <span className={`font-bold flex-shrink-0 ${
              job.source === "youtube" ? "text-red-400" :
              job.source === "reddit"  ? "text-orange-400" : "text-primary"
            }`}>{job.source.toUpperCase()}</span>

            {/* Stats */}
            <span className="text-gray-500 flex-shrink-0">
              {job.stats.scanned} scanned · {job.stats.extracted} extracted · {job.stats.staged} staged
            </span>

            {/* Errors */}
            {job.stats.errors > 0 && (
              <span className="text-red-400">{job.stats.errors} errors</span>
            )}

            {/* Time */}
            <span className="ml-auto text-gray-700 flex-shrink-0">
              {job.completedAt
                ? new Date(job.completedAt).toLocaleTimeString()
                : "running..."}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
