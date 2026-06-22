"use client";

import React from 'react';

interface ActivityScore {
  activities: { name: string, type: string };
  meta_score: number;
  threat_level: string;
  confidence_score: number;
}

export function ActivityPerformanceMatrix({ scores }: { scores: ActivityScore[] }) {
  // A conceptual component for the Build Dossier showing heatmaps/radars
  // Real implementation would use Chart.js or D3.js or SVG polygons
  
  if (!scores || scores.length === 0) return <div>No activity data</div>;
  
  return (
    <div className="bg-black/40 border border-gray-800 p-6 rounded-xl flex flex-col space-y-4">
      <h3 className="text-xl font-bold text-orange-500 font-mono tracking-widest uppercase">
        Activity Performance
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HEATMAP / MATRIX */}
        <div className="space-y-3">
          {scores.map((score, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-800 hover:border-orange-500/50 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-mono">{score.activities.type}</span>
                <span className="text-md font-semibold text-gray-200">{score.activities.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 font-mono">META</span>
                  <span className={`text-lg font-bold ${score.meta_score > 85 ? 'text-cyan-400' : 'text-gray-300'}`}>
                    {score.meta_score}
                  </span>
                </div>
                <div className="flex flex-col items-end w-16">
                  <span className="text-xs text-gray-500 font-mono">THREAT</span>
                  <span className={`text-sm font-bold ${score.threat_level === 'OMEGA' ? 'text-orange-500' : 'text-gray-400'}`}>
                    {score.threat_level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
