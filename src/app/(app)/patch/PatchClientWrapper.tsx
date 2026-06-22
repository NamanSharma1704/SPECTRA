"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function PatchClientWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();
    
    // Header sequence
    tl.fromTo(containerRef.current.querySelector('.patch-header'),
      { opacity: 0, x: -30, filter: "blur(8px)" },
      { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }
    );

    // Active Patch overview reveal
    tl.fromTo(containerRef.current.querySelector('.patch-overview'),
      { opacity: 0, scaleY: 0, transformOrigin: "top" },
      { opacity: 1, scaleY: 1, duration: 0.4, ease: "circ.out" },
      "-=0.1"
    );

    // Stagger all glass panels
    const panels = containerRef.current.querySelectorAll('.glass-card, .patch-panel');
    if (panels.length > 0) {
      tl.fromTo(panels,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.1, 
          duration: 0.5, 
          ease: "back.out(1.2)",
          clearProps: "all"
        },
        "-=0.2"
      );
    }
    
    // Timeline animation
    const timelineItems = containerRef.current.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
      tl.fromTo(timelineItems,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
        "-=0.3"
      );
    }

  }, []);

  return (
    <div ref={containerRef} className="space-y-8 max-w-[1600px] mx-auto pt-6 pb-20">
      {children}
    </div>
  );
}
