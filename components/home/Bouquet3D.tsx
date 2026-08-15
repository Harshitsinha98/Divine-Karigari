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

function makeEmojiTexture(emoji: string, bg: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.font = `${size * 0.55}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.04);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// A single product rendered as a card mounted on a thin stick, the way
// items fan out of a real gift bouquet.
function ProductCard3D({
  bloom,
  position,
  rotation,
  scale,
}: {
  bloom: Bloom3D;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const fallback = useMemo(
    () => makeEmojiTexture(guessEmoji(bloom.name), bloom.color),
    [bloom.name, bloom.color],
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

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* stick into the wrap */}
      <mesh position={[0, -0.95, -0.02]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 1.7, 8]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.8} />
      </mesh>
      {/* white card backing */}
      <mesh position={[0, 0, -0.015]} castShadow>
        <planeGeometry args={[0.62, 0.8]} />
        <meshStandardMaterial
          color="#fffdf8"
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
      {/* product face */}
      <mesh>
        <planeGeometry args={[0.56, 0.74]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// Black + gold paper wrap with a pink ribbon bow, matching a gift bouquet.
function Wrap() {
  return (
    <group>
      {/* black paper cone */}
      <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 0.2, 1.75, 36, 1, true]} />
        <meshStandardMaterial
          color="#181310"
          roughness={0.85}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* gold top rim */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.03, 0.045, 16, 48]} />
        <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* gold seam */}
      <mesh position={[0, -0.2, 0.52]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.05, 1.4, 0.02]} />
        <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* pink ribbon bow */}
      <group position={[0, -0.95, 0.62]}>
        <mesh position={[-0.17, 0, 0]} rotation={[0, 0, 0.6]} scale={[0.24, 0.14, 0.06]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#D6206E" roughness={0.4} />
        </mesh>
        <mesh position={[0.17, 0, 0]} rotation={[0, 0, -0.6]} scale={[0.24, 0.14, 0.06]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#D6206E" roughness={0.4} />
        </mesh>
        <mesh scale={[0.09, 0.11, 0.09]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#B01259" roughness={0.4} />
        </mesh>
        <mesh position={[-0.09, -0.34, 0]} rotation={[0, 0, 0.18]}>
          <boxGeometry args={[0.09, 0.6, 0.03]} />
          <meshStandardMaterial color="#D6206E" roughness={0.45} />
        </mesh>
        <mesh position={[0.09, -0.36, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.09, 0.64, 0.03]} />
          <meshStandardMaterial color="#D6206E" roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

function Leaves() {
  const leaves: { pos: [number, number, number]; rot: number }[] = [
    { pos: [-0.85, 0.55, -0.2], rot: 0.9 },
    { pos: [0.88, 0.5, -0.2], rot: -0.9 },
    { pos: [0.0, 1.15, -0.25], rot: 0 },
  ];
  return (
    <group>
      {leaves.map((leaf, i) => (
        <mesh
          key={i}
          position={leaf.pos}
          rotation={[0, 0, leaf.rot]}
          scale={[0.16, 0.34, 0.06]}
          castShadow
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#2f5a45" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ blooms }: { blooms: Bloom3D[] }) {
  const n = blooms.length;
  const spread = Math.min(1.75, 0.55 + n * 0.2);
  return (
    <group position={[0, -0.2, 0]}>
      <Wrap />
      <Leaves />
      {blooms.map((bloom, i) => {
        const t = n > 1 ? i / (n - 1) : 0.5;
        const ang = (t - 0.5) * spread;
        const row = i % 2;
        const radius = 1.2 + row * 0.12;
        const x = Math.sin(ang) * radius;
        const y = 0.5 + Math.cos(ang) * radius * 0.6 + row * 0.14;
        const z = -Math.abs(Math.sin(ang)) * 0.3 + (row === 0 ? 0.22 : 0);
        const rotZ = -ang * 0.7;
        const rotY = ang * 0.55;
        const s = (0.98 - row * 0.06) * (1 + (((i % 3) - 1) * 0.04));
        return (
          <ProductCard3D
            key={bloom.id}
            bloom={bloom}
            position={[x, y, z]}
            rotation={[0.08, rotY, rotZ]}
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
      camera={{ position: [0, 0.45, 5.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, 3]} intensity={0.45} />
      <Scene blooms={blooms} />
      <ContactShadows
        position={[0, -1.55, 0]}
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
        autoRotateSpeed={0.8}
        target={[0, 0.3, 0]}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.3}
      />
    </Canvas>
  );
}
