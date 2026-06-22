"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { Settings2, ArrowRight, User, Terminal } from "lucide-react";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { AgentProfileModal } from "@/components/profile/AgentProfileModal";

export default function RecommendPage() {
  const { profile, isLoaded, saveProfile } = useAgentProfile();
  const [activity, setActivity] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initial Entry Animation
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;
    
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current.querySelector('.rec-header'),
      { opacity: 0, y: -20, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
    );

    tl.fromTo(containerRef.current.querySelectorAll('.rec-activity-btn'),
      { opacity: 0, scale: 0.9, y: 10 },
      { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "back.out(1.5)" },
      "-=0.2"
    );
  }, [isLoaded]);

  // Results Reveal Animation
  useEffect(() => {
    if (results && !loading && resultsRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(resultsRef.current.querySelectorAll('.rec-card-wrapper'),
        { opacity: 0, y: 30, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.15, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [results, loading]);

  const handleActivitySelect = async (selectedActivity: string) => {
    setActivity(selectedActivity);
    setLoading(true);
    setError(null);
    setResults(null);
    
    await new Promise(r => setTimeout(r, 800));
    
    try {
      let url = `/api/recommend?activity=${selectedActivity.toLowerCase()}`;
      if (profile) {
        url += `&playstyle=${encodeURIComponent(profile.playstyle)}&groupSize=${encodeURIComponent(profile.groupSize)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "No intelligence data available for this activity.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to consult intelligence layers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activity && profile && results) {
      const refetch = async () => {
        setLoading(true);
        setError(null);
        try {
          const url = `/api/recommend?activity=${activity.toLowerCase()}&playstyle=${encodeURIComponent(profile.playstyle)}&groupSize=${encodeURIComponent(profile.groupSize)}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          } else {
            setResults(null);
            const errData = await res.json().catch(() => ({}));
            setError(errData.error || "No intelligence data available for this activity.");
          }
        } catch (e) {
          console.error(e);
          setError("Failed to consult intelligence layers.");
        } finally {
          setLoading(false);
        }
      };
      refetch();
    }
  }, [profile?.playstyle, profile?.groupSize]);

  if (!isLoaded) return null;

  return (
    <>
      <div ref={containerRef} className="max-w-[1600px] mx-auto pt-6 pb-24 space-y-12">
        
        {/* Header & Profile Actions */}
        <div className="rec-header flex justify-between items-start border-b border-primary/20 pb-8 relative">
          <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
          <div>
            <div className="text-[10px] font-sans font-bold text-primary tracking-widest mb-2 uppercase flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Division Decision Engine
            </div>
            {profile && !activity ? (
              <h1 className="text-4xl font-bold font-heading text-primary neon-text tracking-widest uppercase">
                Welcome Back Agent
              </h1>
            ) : (
              <h1 className="text-4xl font-bold font-heading text-primary neon-text tracking-widest uppercase">
                Select Operation
              </h1>
            )}
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileModal(true)}
            className="border border-primary/50 bg-primary/10 text-primary hover:text-white hover:bg-primary/30 px-4 py-2 font-sans font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <User className="w-4 h-4 relative z-10" /> 
            <span className="relative z-10">{profile ? "Update Profile" : "Configure Profile"}</span>
          </motion.button>
        </div>

        {/* Step 1: Activity Selection */}
        {!activity && profile && profile.favoriteActivities.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-bold font-sans text-gray-500 tracking-widest uppercase mb-4">Favorite Activities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.favoriteActivities.map((act) => (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={act}
                  onClick={() => handleActivitySelect(act)}
                  className="rec-activity-btn p-4 glass-card glass-card-hover text-gray-300 hover:text-primary font-heading font-bold text-lg tracking-widest uppercase transition-all"
                >
                  {act}
                </motion.button>
              ))}
            </div>
            <div className="mt-8 text-[10px] font-sans font-bold text-gray-600 uppercase tracking-widest">Or select another:</div>
          </div>
        )}

        {/* All Activities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["Legendary", "Incursion", "Raid", "Countdown", "Open World"].map((act) => {
            if (!activity && profile?.favoriteActivities.includes(act)) return null;
            return (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                key={act}
                onClick={() => handleActivitySelect(act)}
                className={`rec-activity-btn p-4 border font-heading font-bold text-lg tracking-widest uppercase transition-all ${
                  activity === act 
                    ? "border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(255,106,0,0.3)]" 
                    : "glass-card glass-card-hover text-gray-500 hover:text-primary"
                }`}
              >
                {act}
              </motion.button>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block border border-primary/50 bg-primary/10 text-primary font-sans font-bold text-xs px-6 py-3 uppercase tracking-[0.2em] animate-pulse relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
              Consulting ISAC Network...
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-block border border-red-500/50 bg-red-900/20 text-red-400 font-sans font-bold text-sm px-6 py-4 uppercase tracking-widest max-w-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <div className="font-heading text-red-500 mb-2 text-2xl tracking-[0.2em]">ACCESS DENIED</div>
              {error}
              <div className="mt-4 text-[10px] text-red-500/70 lowercase tracking-widest">ISAC: Insufficient sample size in current database. Waiting for more forecast ingestions.</div>
            </div>
          </div>
        )}

        {/* Dual-Wielding Recommendations */}
        {results && !loading && (
          <div ref={resultsRef} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Meta Pick (Objective) */}
              <div className="rec-card-wrapper">
                <h2 className="text-xl font-bold font-heading text-white uppercase tracking-widest mb-6 text-center drop-shadow-md">
                  Best Build For <span className="text-primary">{activity}</span>
                </h2>
                <RecommendationCard build={results.meta} color="orange" activity={activity!} />
              </div>

              {/* Personalized Pick (Subjective) */}
              {results.personalized && profile && (
                <div className="rec-card-wrapper">
                  <h2 className="text-xl font-bold font-heading text-white uppercase tracking-widest mb-6 text-center drop-shadow-md">
                    Best Build <span className="text-cyan-400">For You</span>
                  </h2>
                  <RecommendationCard 
                    build={results.personalized} 
                    color="cyan" 
                    playstyle={profile.playstyle} 
                    groupSize={profile.groupSize} 
                    activity={activity!} 
                  />
                </div>
              )}
            </div>

            {/* Toggle Advanced Filters */}
            {!showAdvanced && (
              <div className="text-center pt-8 border-t border-white/10">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowAdvanced(true)}
                  className="inline-flex items-center gap-2 text-xs font-sans font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                >
                  <Settings2 className="w-4 h-4" /> View Alternatives & Specialized Picks
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Specialized Picks */}
        {showAdvanced && results && !loading && (
          <div className="pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold font-heading text-white uppercase tracking-widest mb-8 text-center drop-shadow-md">
              Alternatives & Specialists
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rec-card-wrapper"><RecommendationCard build={results.alternative} color="orange" activity={activity!} /></div>
              <div className="rec-card-wrapper"><RecommendationCard build={results.safe} color="green" activity={activity!} /></div>
              <div className="rec-card-wrapper"><RecommendationCard build={results.emerging} color="purple" activity={activity!} /></div>
              <div className="rec-card-wrapper"><RecommendationCard build={results.returning} color="blue" activity={activity!} /></div>
            </div>
          </div>
        )}

      </div>

      {showProfileModal && (
        <AgentProfileModal 
          onClose={() => setShowProfileModal(false)} 
          profile={profile}
          onSave={saveProfile}
        />
      )}
    </>
  );
}
