"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Play } from "lucide-react";
import Image from "next/image";

export function MediaVault({ intelFeeds }: { intelFeeds: any }) {
  const tabs = [
    { id: "pvp", label: "PVP INTEL", videos: intelFeeds?.pvpVideos || [] },
    { id: "farming", label: "FARMING GUIDES", videos: intelFeeds?.farmingGuides || [] },
    { id: "patch", label: "PATCH ANALYSIS", videos: intelFeeds?.patchVideos || [] },
  ];
  
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeVideos = tabs.find(t => t.id === activeTab)?.videos || [];

  return (
    <div className="mt-8 border-t border-white/10 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          <Video className="w-4 h-4 text-white/50" />
        </div>
        <div className="text-left">
          <h2 className="font-heading text-lg font-bold tracking-widest text-white uppercase">
            Media Intercepts
          </h2>
          <p className="text-[10px] font-sans text-gray-500 uppercase tracking-widest mt-1">
            Raw intelligence from creators, analysts, and field agents
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap text-[11px] font-heading font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab.id ? "text-white" : "text-gray-600 hover:text-gray-400"
            } relative`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeMediaTab"
                className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-white"
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {activeVideos.slice(0, 4).map((video: any) => (
            <motion.a
              key={video.video_id}
              href={`https://youtube.com/watch?v=${video.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group block bg-[#0A0A0A] border border-white/5 rounded-lg overflow-hidden transition-all hover:border-white/20 hover:-translate-y-1"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                {video.thumbnail_url ? (
                  <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-8 h-8 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                   <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/20 transform scale-90 group-hover:scale-100 transition-transform">
                     <Play className="w-4 h-4 text-white ml-1" />
                   </div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-[11px] font-sans text-gray-300 line-clamp-2 leading-tight group-hover:text-white transition-colors mb-2">
                  {video.title}
                </div>
                <div className="flex items-center justify-between text-[9px] font-heading text-gray-500 uppercase tracking-widest">
                  <span>{video.creator}</span>
                  <span>{new Date(video.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
        
        {activeVideos.length === 0 && (
          <div className="col-span-full py-10 text-center text-[10px] font-heading text-gray-600 tracking-widest uppercase">
            No intelligence available for this category
          </div>
        )}
      </div>
    </div>
  );
}
