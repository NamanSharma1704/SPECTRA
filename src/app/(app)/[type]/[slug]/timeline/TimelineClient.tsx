"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function TimelineClient({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();
    
    // Header entry
    tl.fromTo(containerRef.current.querySelector('.timeline-header'),
      { opacity: 0, y: -20, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
    );

  }, []);

  return <div ref={containerRef}>{children}</div>;
}
