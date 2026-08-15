"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { guessEmoji } from "@/lib/builder";

export type Bloom3D = {
  id: string;
  name: string;
  image?: string;
  color: string;
  qty: number;
};

const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

// Baby's-breath filler positions (x, y, z) around the head for fullness.
const FILLER: [number, number, number][] = [
  [-0.75, 1.05, 0.15],
  [0.72, 1.0, 0.12],
  [-0.45, 1.35, 0.05],
  [0.5, 1.32, 0.05],
  [0.02, 1.5, 0.0],
  [-0.95, 0.6, 0.1],
  [0.92, 0.58, 0.1],
  [-0.3, 0.35, 0.2],
  [0.34, 0.4, 0.2],
  [0.0, 1.15, 0.3],
];

// Simple leaf accents (position, rotationZ).
const LEAVES: { pos: [number, number, number]; rot: number }[] = [
  { pos: [-0.7, 0.35, 0], rot: 0.9 },
  { pos: [0.72, 0.4, 0], rot: -0.9 },
  { pos: [-0.35, 0.15, 0.1], rot: 0.4 },
  { pos: [0.4, 0.12, 0.1], rot: -0.4 },
];

function makeEmojiTexture(emoji: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${size * 0.6}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.04);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function BloomMesh({
  bloom,
  position,
  scale,
}: {
  bloom: Bloom3D;
  position: [number, number, number];
  scale: number;
}) {
  const fallback = useMemo(
    () => makeEmojiTexture(guessEmoji(bloom.name)),
    [bloom.name],
  );
  const [texture, setTexture] = useState<THREE.Texture>(fallback);

  useEffect(() => {
    let active = true;
    if (bloom.image) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(
        bloom.image,
        (loaded) => {
          if (!active) return;
          loaded.colorSpace = THREE.SRGBColorSpace;
          setTexture(loaded);
        },
        undefined,
        () => {
          /* keep emoji fallback on error */
        },
      );
    }
    return () => {
      active = false;
    };
  }, [bloom.image]);

  const petals = useMemo(
    () => Array.from({ length: 8 }, (_, j) => j * (Math.PI / 4)),
    [],
  );

  return (
    <group position={position} scale={scale}>
      {petals.map((angle, j) => (
        <mesh
          key={j}
          position={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0]}
          rotation={[0, 0, angle]}
          scale={[0.28, 0.16, 0.1]}
          castShadow
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={bloom.color} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.14]}>
        <circleGeometry args={[0.3, 40]} />
        <meshStandardMaterial map={texture} roughness={0.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <ringGeometry args={[0.3, 0.34, 40]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Wrap() {
  return (
    <group>
      {/* kraft paper funnel */}
      <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.98, 0.22, 1.55, 28, 1, true]} />
        <meshStandardMaterial
          color="#c9ad82"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* inner shade */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.9, 0.2, 1.4, 28, 1, true]} />
        <meshStandardMaterial
          color="#8f6f45"
          roughness={1}
          side={THREE.BackSide}
        />
      </mesh>
      {/* ribbon */}
      <mesh position={[0, -1.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.3, 0.07, 14, 28]} />
        <meshStandardMaterial color="#B8862E" roughness={0.4} metalness={0.15} />
      </mesh>
    </group>
  );
}

function Greenery() {
  return (
    <group>
      {LEAVES.map((leaf, i) => (
        <mesh
          key={i}
          position={leaf.pos}
          rotation={[0, 0, leaf.rot]}
          scale={[0.14, 0.3, 0.08]}
          castShadow
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#35644D" roughness={0.7} />
        </mesh>
      ))}
      {/* stems bundle */}
      {[-0.08, 0, 0.08, 0.04].map((x, i) => (
        <mesh key={i} position={[x, -0.1, 0.02]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
          <meshStandardMaterial color="#274B3B" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ blooms }: { blooms: Bloom3D[] }) {
  return (
    <group position={[0, -0.35, 0]}>
      <Wrap />
      <Greenery />
      {blooms.length > 0 &&
        FILLER.map((pos, i) => (
          <mesh key={`filler-${i}`} position={pos} scale={0.05}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#fffaf0" roughness={0.6} />
          </mesh>
        ))}
      {blooms.map((bloom, i) => {
        const theta = i * GOLDEN_ANGLE;
        const r = 0.44 * Math.sqrt(i);
        const x = Math.cos(theta) * r;
        const y = 0.7 + Math.sin(theta) * r;
        const z = 0.55 - r * 0.3;
        const s = 1 - (i % 3) * 0.08;
        return (
          <BloomMesh
            key={bloom.id}
            bloom={bloom}
            position={[x, y, z]}
            scale={s}
          />
        );
      })}
    </group>
  );
}

export default function Bouquet3D({ blooms }: { blooms: Bloom3D[] }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.5, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, 2]} intensity={0.4} />
      <Scene blooms={blooms} />
      <ContactShadows
        position={[0, -1.75, 0]}
        opacity={0.35}
        scale={6}
        blur={2.6}
        far={4}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.1}
        target={[0, 0.25, 0]}
        minPolarAngle={Math.PI / 2 - 0.55}
        maxPolarAngle={Math.PI / 2 + 0.35}
      />
    </Canvas>
  );
}
