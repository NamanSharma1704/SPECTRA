"use client";
import { useEffect, useRef } from "react";

interface RadarPoint {
  label: string;
  score: number; // 0-100
}

interface ActivityRadarChartProps {
  points: RadarPoint[];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildPolygonPath(cx: number, cy: number, r: number, scores: number[], count: number) {
  return scores
    .map((score, i) => {
      const angle = (360 / count) * i;
      const { x, y } = polarToCartesian(cx, cy, (r * score) / 100, angle);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function buildRingPath(cx: number, cy: number, r: number, count: number) {
  return Array.from({ length: count })
    .map((_, i) => {
      const angle = (360 / count) * i;
      const { x, y } = polarToCartesian(cx, cy, r, angle);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

export function ActivityRadarChart({ points }: ActivityRadarChartProps) {
  const polygonRef = useRef<SVGPathElement>(null);
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 90;
  const count = points.length;

  useEffect(() => {
    if (!polygonRef.current) return;
    const len = polygonRef.current.getTotalLength();
    polygonRef.current.style.strokeDasharray = `${len}`;
    polygonRef.current.style.strokeDashoffset = `${len}`;
    requestAnimationFrame(() => {
      if (polygonRef.current) {
        polygonRef.current.style.transition = "stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)";
        polygonRef.current.style.strokeDashoffset = "0";
      }
    });
  }, [points]);

  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Background rings */}
        {rings.map((pct, ri) => (
          <path
            key={ri}
            d={buildRingPath(CX, CY, R * pct, count)}
            fill="none"
            stroke={ri === rings.length - 1 ? "#334155" : "#1e293b"}
            strokeWidth={ri === rings.length - 1 ? 1 : 0.5}
          />
        ))}

        {/* Axis lines */}
        {points.map((_, i) => {
          const { x, y } = polarToCartesian(CX, CY, R, (360 / count) * i);
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={x.toFixed(2)} y2={y.toFixed(2)}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon fill */}
        <path
          d={buildPolygonPath(CX, CY, R, points.map((p) => p.score), count)}
          fill="rgba(255, 106, 0, 0.12)"
          stroke="none"
        />

        {/* Data polygon stroke — animated */}
        <path
          ref={polygonRef}
          d={buildPolygonPath(CX, CY, R, points.map((p) => p.score), count)}
          fill="none"
          stroke="#FF6A00"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Data point dots */}
        {points.map((pt, i) => {
          const { x, y } = polarToCartesian(CX, CY, (R * pt.score) / 100, (360 / count) * i);
          return (
            <circle
              key={i}
              cx={x} cy={y} r={3}
              fill="#FF6A00"
              className="drop-shadow-[0_0_4px_rgba(255,106,0,0.8)]"
            />
          );
        })}

        {/* Labels */}
        {points.map((pt, i) => {
          const angle = (360 / count) * i;
          const { x, y } = polarToCartesian(CX, CY, R + 18, angle);
          const anchor = x < CX - 5 ? "end" : x > CX + 5 ? "start" : "middle";
          return (
            <text
              key={i}
              x={x.toFixed(2)}
              y={(y + (y < CY ? -4 : 4)).toFixed(2)}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="8"
              fill="#6b7280"
              fontFamily="monospace"
            >
              {pt.label.toUpperCase()}
            </text>
          );
        })}

        {/* Score dots label */}
        {points.map((pt, i) => {
          const { x, y } = polarToCartesian(CX, CY, (R * pt.score) / 100 - 12, (360 / count) * i);
          if (pt.score < 30) return null;
          return (
            <text key={i} x={x.toFixed(2)} y={y.toFixed(2)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#FF6A00" fontFamily="monospace" fontWeight="bold">
              {pt.score}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
