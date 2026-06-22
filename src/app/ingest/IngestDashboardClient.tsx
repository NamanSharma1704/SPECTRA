"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function IngestDashboardClient({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();
    
    // Header entry
    tl.fromTo(containerRef.current.querySelector('.ingest-header'),
      { opacity: 0, y: -20, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
    );

    // Staggered panel entries
    tl.fromTo(containerRef.current.querySelectorAll('.ingest-panel'),
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      "-=0.3"
    );

  }, []);

  return <div ref={containerRef}>{children}</div>;
}
