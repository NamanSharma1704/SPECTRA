"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Video } from "lucide-react";
import { CategorizedVideoFeed } from "./CategorizedVideoFeed";

export function MediaVault({ intelFeeds }: { intelFeeds: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 border border-white/5 bg-[#050505]/60 backdrop-blur-md rounded-xl overflow-hidden transition-colors hover:border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="font-heading text-xl font-bold tracking-widest text-white uppercase">
              Global Media Vault
            </h2>
            <p className="text-xs font-sans text-gray-500 mt-1">
              Access raw video intelligence intercepts (PVP, Farming, Patch Reviews)
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-6 md:p-8 bg-black/20">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <CategorizedVideoFeed title="LATEST PVP INTEL" videos={intelFeeds?.pvpVideos} color="cyan" />
                <CategorizedVideoFeed title="LATEST FARMING GUIDES" videos={intelFeeds?.farmingGuides} color="primary" />
                <CategorizedVideoFeed title="LATEST PATCH VIDEOS" videos={intelFeeds?.patchVideos} color="purple" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
