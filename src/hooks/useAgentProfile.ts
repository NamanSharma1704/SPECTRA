import { useState, useEffect } from 'react';

export interface AgentProfile {
  playstyle: string;
  groupSize: string;
  favoriteActivities: string[];
}

export const DEFAULT_PROFILE: AgentProfile = {
  playstyle: "Aggressive DPS",
  groupSize: "Solo",
  favoriteActivities: []
};

export function useAgentProfile() {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('agent_profile');
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse agent profile from local storage");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = (newProfile: AgentProfile) => {
    localStorage.setItem('agent_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const clearProfile = () => {
    localStorage.removeItem('agent_profile');
    setProfile(null);
  };

  return { profile, isLoaded, saveProfile, clearProfile, DEFAULT_PROFILE };
}
