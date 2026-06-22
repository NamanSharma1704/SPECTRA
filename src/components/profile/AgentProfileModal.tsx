"use client";

import { useState } from "react";
import { X, Save, User } from "lucide-react";
import { AgentProfile, DEFAULT_PROFILE } from "@/hooks/useAgentProfile";

interface AgentProfileModalProps {
  onClose: () => void;
  profile: AgentProfile | null;
  onSave: (profile: AgentProfile) => void;
}

export function AgentProfileModal({ onClose, profile, onSave }: AgentProfileModalProps) {
  const [formData, setFormData] = useState<AgentProfile>(profile || DEFAULT_PROFILE);

  const toggleActivity = (activity: string) => {
    setFormData(prev => {
      const current = prev.favoriteActivities;
      if (current.includes(activity)) {
        return { ...prev, favoriteActivities: current.filter(a => a !== activity) };
      } else {
        return { ...prev, favoriteActivities: [...current, activity] };
      }
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-950 border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-purple-950/20">
          <div>
            <h2 className="text-xl font-black font-mono text-white tracking-tight uppercase flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Agent Profile Configuration
            </h2>
            <p className="text-xs font-mono text-purple-300/70 tracking-widest uppercase mt-1">
              Calibrate the Decision Engine to your exact playstyle.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Group Size */}
          <div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Target Group Size</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Solo", "Duo", "Full Group (4)", "Raid (8)"].map(size => (
                <button
                  key={size}
                  onClick={() => setFormData({ ...formData, groupSize: size })}
                  className={`p-3 border font-mono text-xs tracking-wider uppercase transition-all ${
                    formData.groupSize === size 
                      ? "border-purple-500 bg-purple-900/20 text-white" 
                      : "border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Playstyle */}
          <div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Preferred Playstyle</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Aggressive DPS", "Sniper / Marksman", "Skill Damage", "Tank / Bruiser", "Support / Healer"].map(style => (
                <button
                  key={style}
                  onClick={() => setFormData({ ...formData, playstyle: style })}
                  className={`p-3 border font-mono text-xs tracking-wider uppercase transition-all ${
                    formData.playstyle === style 
                      ? "border-purple-500 bg-purple-900/20 text-white" 
                      : "border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Activities */}
          <div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Favorite Activities</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Legendary", "Incursion", "Raid", "Countdown", "Open World", "Summit"].map(act => (
                <button
                  key={act}
                  onClick={() => toggleActivity(act)}
                  className={`p-3 border font-mono text-xs tracking-wider uppercase transition-all ${
                    formData.favoriteActivities.includes(act)
                      ? "border-purple-500 bg-purple-900/20 text-white" 
                      : "border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm px-6 py-3 uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>

      </div>
    </div>
  );
}
