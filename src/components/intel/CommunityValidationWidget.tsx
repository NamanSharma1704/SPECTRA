"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, CheckCircle2, AlertTriangle, XOctagon, Activity } from "lucide-react";

interface ValidationStats {
  targetId: string;
  totalVotes: number;
  voteVelocity: number;
  approvalPercent: number;
  breakdown: {
    worksGreat: number;
    currentPatchViable: number;
    requiresUpdate: number;
    outdated: number;
  };
  hasEnoughData: boolean;
}

export function CommunityValidationWidget({ targetId, targetType }: { targetId: string, targetType: string }) {
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [localVote, setLocalVote] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for previous vote
    const storedVote = localStorage.getItem(`vote_${targetId}`);
    if (storedVote) setLocalVote(storedVote);

    fetchStats();
  }, [targetId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/validation?targetId=${targetId}&targetType=${targetType}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: string) => {
    if (voting) return;
    setVoting(true);

    try {
      const res = await fetch("/api/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, targetType, voteType })
      });

      if (res.ok) {
        const updatedStats = await res.json();
        setStats(updatedStats);
        setLocalVote(voteType);
        localStorage.setItem(`vote_${targetId}`, voteType);
      }
    } catch (error) {
      console.error("Failed to vote", error);
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="border border-gray-800 p-6 animate-pulse bg-gray-900/20" />;
  if (!stats) return null;

  return (
    <div className="border border-gray-800 bg-black p-6 mt-6">
      <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-sm font-bold font-mono text-white tracking-widest uppercase flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-400" /> Community Sentiment
          </h3>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Player Validation & Feedback
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
            Community Approval
          </div>
          {stats.hasEnoughData ? (
            <div className={`text-3xl font-black font-mono ${
              stats.approvalPercent >= 80 ? "text-green-500" :
              stats.approvalPercent >= 50 ? "text-yellow-500" : "text-red-500"
            }`}>
              {stats.approvalPercent}%
            </div>
          ) : (
            <div className="text-sm font-bold font-mono text-gray-400 uppercase">
              Not Enough Data
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Voting Options */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Cast Your Vote</div>
          <button 
            disabled={voting}
            onClick={() => handleVote("WORKS_GREAT")}
            className={`w-full flex items-center justify-between p-3 border font-mono text-xs uppercase tracking-widest transition-colors ${
              localVote === "WORKS_GREAT" ? "border-green-500 bg-green-900/20 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
            }`}
          >
            <span className="flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> Works Great</span>
          </button>
          
          <button 
            disabled={voting}
            onClick={() => handleVote("CURRENT_PATCH_VIABLE")}
            className={`w-full flex items-center justify-between p-3 border font-mono text-xs uppercase tracking-widest transition-colors ${
              localVote === "CURRENT_PATCH_VIABLE" ? "border-blue-500 bg-blue-900/20 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
            }`}
          >
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Current Patch Viable</span>
          </button>

          <button 
            disabled={voting}
            onClick={() => handleVote("REQUIRES_UPDATE")}
            className={`w-full flex items-center justify-between p-3 border font-mono text-xs uppercase tracking-widest transition-colors ${
              localVote === "REQUIRES_UPDATE" ? "border-yellow-500 bg-yellow-900/20 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
            }`}
          >
            <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Requires Update</span>
          </button>

          <button 
            disabled={voting}
            onClick={() => handleVote("OUTDATED")}
            className={`w-full flex items-center justify-between p-3 border font-mono text-xs uppercase tracking-widest transition-colors ${
              localVote === "OUTDATED" ? "border-red-500 bg-red-900/20 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
            }`}
          >
            <span className="flex items-center gap-2"><XOctagon className="w-4 h-4" /> Outdated</span>
          </button>
        </div>

        {/* Results Breakdown */}
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 flex justify-between items-center">
            <span>Vote Breakdown</span>
            <span>{stats.totalVotes} Total</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>Works Great</span>
                <span>{stats.hasEnoughData ? `${Math.round((stats.breakdown.worksGreat / stats.totalVotes) * 100)}%` : stats.breakdown.worksGreat}</span>
              </div>
              <div className="w-full bg-gray-900 h-1"><div className="bg-green-500 h-1" style={{ width: `${stats.totalVotes ? (stats.breakdown.worksGreat / stats.totalVotes) * 100 : 0}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>Patch Viable</span>
                <span>{stats.hasEnoughData ? `${Math.round((stats.breakdown.currentPatchViable / stats.totalVotes) * 100)}%` : stats.breakdown.currentPatchViable}</span>
              </div>
              <div className="w-full bg-gray-900 h-1"><div className="bg-blue-500 h-1" style={{ width: `${stats.totalVotes ? (stats.breakdown.currentPatchViable / stats.totalVotes) * 100 : 0}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>Needs Update</span>
                <span>{stats.hasEnoughData ? `${Math.round((stats.breakdown.requiresUpdate / stats.totalVotes) * 100)}%` : stats.breakdown.requiresUpdate}</span>
              </div>
              <div className="w-full bg-gray-900 h-1"><div className="bg-yellow-500 h-1" style={{ width: `${stats.totalVotes ? (stats.breakdown.requiresUpdate / stats.totalVotes) * 100 : 0}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>Outdated</span>
                <span>{stats.hasEnoughData ? `${Math.round((stats.breakdown.outdated / stats.totalVotes) * 100)}%` : stats.breakdown.outdated}</span>
              </div>
              <div className="w-full bg-gray-900 h-1"><div className="bg-red-500 h-1" style={{ width: `${stats.totalVotes ? (stats.breakdown.outdated / stats.totalVotes) * 100 : 0}%` }} /></div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
            <span>Vote Velocity</span>
            <span className={stats.voteVelocity > 10 ? "text-purple-400 font-bold" : "text-gray-400"}>+{stats.voteVelocity} in last 48h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
