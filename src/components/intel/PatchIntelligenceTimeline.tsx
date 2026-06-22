import { format } from "date-fns";
import { CircleDot, PlaySquare, Flame, Skull, TrendingDown, BookOpen, UserPlus, Users } from "lucide-react";

interface TimelineEvent {
  type: string;
  date: Date;
  label: string;
  desc: string;
}

export function PatchIntelligenceTimeline({ timeline }: { timeline: TimelineEvent[] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="border border-gray-800 bg-black/30 p-6 mt-8">
      <h2 className="text-lg font-mono font-bold text-gray-300 tracking-widest uppercase mb-8">
        Patch Propagation Timeline
      </h2>

      <div className="relative border-l border-gray-800 ml-4 space-y-8 pb-4">
        {timeline.map((event, idx) => (
          <div key={idx} className="relative pl-8">
            <div className="absolute -left-[17px] top-1">
              {event.type === "patch_release" ? (
                <BookOpen className="w-8 h-8 text-blue-500 bg-[#0a0a0a] p-1 border-2 border-[#0a0a0a] rounded-full" />
              ) : event.type === "creator_signal" ? (
                <UserPlus className="w-6 h-6 text-purple-400 bg-[#0a0a0a] ml-1" />
              ) : event.type === "consensus" ? (
                <Users className="w-6 h-6 text-green-400 bg-[#0a0a0a] ml-1" />
              ) : (
                <TrendingDown className="w-6 h-6 text-orange-500 bg-[#0a0a0a] ml-1" />
              )}
            </div>

            <div>
              <div className="text-xs font-mono text-gray-500 mb-1">
                {format(new Date(event.date), "MMMM d, yyyy")}
              </div>
              <div className="bg-gray-900/30 border border-gray-800/50 p-4">
                <div className={`font-mono text-sm font-bold mb-1 ${
                  event.type === "patch_release" ? "text-blue-400" :
                  event.type === "consensus" ? "text-green-400" :
                  "text-white"
                }`}>{event.label}</div>
                <div className="font-mono text-xs text-gray-400">{event.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
