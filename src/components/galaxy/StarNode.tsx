"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarNode({ position, color, size = 1 }: { position: [number, number, number], color: string, size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      // Gentle floating animation based on position to unsync them
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        // Concept: Zoom into DNA sequence
        console.log("Inspecting node DNA:", position);
      }}
    >
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial 
        color={hovered ? "#ffffff" : color} 
        emissive={hovered ? "#ffffff" : color}
        emissiveIntensity={hovered ? 2 : 1.2}
        wireframe={hovered}
      />
    </mesh>
  );
}
