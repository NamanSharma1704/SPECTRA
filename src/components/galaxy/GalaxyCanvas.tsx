"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { StarNode } from "./StarNode";

// Suppress the THREE.Clock deprecation warning from @react-three/fiber internals
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
      return;
    }
    originalWarn(...args);
  };
}

// Generate some fake cluster data for the initial Galaxy visualizer
const generateCluster = (centerX: number, centerY: number, centerZ: number, count: number, color: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${color}-${i}`,
    position: [
      centerX + (Math.random() - 0.5) * 25,
      centerY + (Math.random() - 0.5) * 25,
      centerZ + (Math.random() - 0.5) * 25,
    ] as [number, number, number],
    color
  }));
};

const dpsCluster = generateCluster(0, 0, 0, 120, "#FF6A00"); // Striker / High DPS (Orange)
const tankCluster = generateCluster(40, -10, -20, 60, "#3B82F6"); // Vanguard / Tank (Blue)
const skillCluster = generateCluster(-35, 25, 15, 90, "#22C55E"); // Eclipse / Skill (Green)
const rogueCluster = generateCluster(10, 40, -30, 30, "#EF4444"); // PvP / Rogue (Red)

const allNodes = [...dpsCluster, ...tankCluster, ...skillCluster, ...rogueCluster];

export function GalaxyCanvas() {
  return (
    <div className="w-full h-full bg-black cursor-crosshair">
      <Canvas 
        camera={{ position: [0, 30, 80], fov: 60 }} 
        dpr={[1, 1.5]} 
        performance={{ min: 0.5 }}
        gl={{ powerPreference: "high-performance", antialias: false }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.2} />
        
        {/* Cinematic volumetric-style lights for the clusters */}
        <pointLight position={[0, 0, 0]} intensity={300} color="#FF6A00" distance={100} />
        <pointLight position={[40, -10, -20]} intensity={200} color="#3B82F6" distance={80} />
        <pointLight position={[-35, 25, 15]} intensity={200} color="#22C55E" distance={80} />
        <pointLight position={[10, 40, -30]} intensity={100} color="#EF4444" distance={50} />
        
        <Stars radius={200} depth={50} count={2500} factor={4} saturation={0} fade speed={0.5} />
        
        {allNodes.map((node) => (
          <StarNode key={node.id} position={node.position} color={node.color} size={Math.random() * 0.8 + 0.3} />
        ))}

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          maxDistance={250}
          minDistance={10}
        />
      </Canvas>
    </div>
  );
}
