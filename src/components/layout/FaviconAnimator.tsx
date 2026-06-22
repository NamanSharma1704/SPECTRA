"use client";
import { useEffect } from "react";

export function FaviconAnimator() {
  useEffect(() => {
    let frameId: number;
    let angleOuter = 0;
    let angleInner = 0;
    
    // Throttle the animation to ~15 FPS (66ms) to prevent high CPU usage
    let lastDraw = 0;
    const FPS_INTERVAL = 66;

    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      
      const elapsed = time - lastDraw;
      if (elapsed < FPS_INTERVAL) return;
      lastDraw = time - (elapsed % FPS_INTERVAL);

      angleOuter = (angleOuter - 2) % 360;
      angleInner = (angleInner + 3) % 360;
      
      // Pulse effect between 0.3 and 1.0 opacity
      const pulseOpacity = 0.5 + Math.abs(Math.sin(time / 500)) * 0.5;

      const svg = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" stroke="#FF6A00" stroke-width="1.5" stroke-opacity="0.3" />
  <g transform="rotate(${angleOuter} 50 50)">
    <circle cx="50" cy="50" r="40" stroke="#FF6A00" stroke-width="1" stroke-dasharray="15 30" stroke-opacity="0.5" />
    <circle cx="50" cy="10" r="2.5" fill="#FF6A00" />
    <circle cx="50" cy="90" r="2.5" fill="#FF6A00" />
  </g>
  <g transform="rotate(${angleInner} 50 50)">
    <circle cx="50" cy="50" r="34" stroke="#FF6A00" stroke-width="2" stroke-dasharray="60 40" stroke-opacity="0.8" />
    <path d="M 50 16 L 47 10 L 53 10 Z" fill="#FF6A00" />
    <path d="M 50 84 L 47 90 L 53 90 Z" fill="#FF6A00" />
  </g>
  <g opacity="${pulseOpacity.toFixed(2)}">
    <polygon points="50,25 25,50 50,50" fill="#FF6A00" fill-opacity="0.4" stroke="#FF6A00" stroke-width="1" />
    <polygon points="50,25 75,50 50,50" fill="#FF6A00" fill-opacity="0.8" stroke="#FF6A00" stroke-width="1" />
    <polygon points="50,75 25,50 50,50" fill="#FF6A00" fill-opacity="0.6" stroke="#FF6A00" stroke-width="1" />
    <polygon points="50,75 75,50 50,50" fill="#FF6A00" fill-opacity="0.2" stroke="#FF6A00" stroke-width="1" />
    <circle cx="50" cy="50" r="3" fill="#FFF" />
  </g>
  <line x1="2" y1="50" x2="18" y2="50" stroke="#FF6A00" stroke-width="1.5" stroke-opacity="0.6" />
  <line x1="82" y1="50" x2="98" y2="50" stroke="#FF6A00" stroke-width="1.5" stroke-opacity="0.6" />
  <line x1="50" y1="2" x2="50" y2="18" stroke="#FF6A00" stroke-width="1.5" stroke-opacity="0.6" />
  <line x1="50" y1="82" x2="50" y2="98" stroke="#FF6A00" stroke-width="1.5" stroke-opacity="0.6" />
</svg>`.trim();

      const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      
      // Update all existing favicons injected by Next.js
      let links = document.querySelectorAll("link[rel*='icon']");
      if (links.length === 0) {
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/svg+xml";
        document.head.appendChild(link);
        links = document.querySelectorAll("link[rel*='icon']");
      }

      links.forEach((link) => {
        (link as HTMLLinkElement).href = dataUrl;
      });
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
