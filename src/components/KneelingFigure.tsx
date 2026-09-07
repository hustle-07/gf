import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface KneelingFigureProps {
  // idle = gentle breathing, presenting = arm raised offering rose
  mode?: 'idle' | 'presenting';
}

export const KneelingFigure: React.FC<KneelingFigureProps> = ({ mode = 'idle' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const roseGroupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Mesh>(null);
  const forearmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Gentle body breathing
    if (groupRef.current) {
      groupRef.current.position.y = 0.02 * Math.sin(t * 1.2);
    }

    // Animate arm & rose based on mode
    if (roseGroupRef.current && forearmRef.current && armRef.current) {
      if (mode === 'presenting') {
        // Arm raises upward — offering rose forward to player
        const liftT = Math.min((t % 999) / 1.2, 1); // ease up
        const lift = liftT * 0.55;

        armRef.current.rotation.x = -0.55 - lift;
        forearmRef.current.rotation.x = -0.80 - lift * 0.5;

        // Rose floats up with slight hover
        roseGroupRef.current.position.y = 1.05 + lift * 0.45 + 0.03 * Math.sin(t * 2.5);
        roseGroupRef.current.position.z = 0.95 + lift * 0.2;

        // Rose spins slowly as presented
        roseGroupRef.current.rotation.y = t * 0.6;
      } else {
        // Idle: slight trembling (nervous)
        roseGroupRef.current.position.y = 1.05 + 0.015 * Math.sin(t * 3.5);
        roseGroupRef.current.rotation.y = 0;
        armRef.current.rotation.x = -0.55;
        forearmRef.current.rotation.x = -0.80;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, -5.5]} rotation={[0, Math.PI, 0]}>

      {/* ── RIGHT LEG — kneeling (knee on ground) ── */}
      {/* Thigh angled down */}
      <mesh position={[0.22, 0.38, 0.18]} rotation={[Math.PI * 0.38, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.10, 0.52, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Shin vertical */}
      <mesh position={[0.22, 0.14, 0.42]}>
        <cylinderGeometry args={[0.09, 0.10, 0.38, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Foot flat */}
      <mesh position={[0.22, -0.03, 0.50]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.14, 0.26, 0.1]} />
        <meshStandardMaterial color="#44261a" roughness={0.9} />
      </mesh>

      {/* ── LEFT LEG — bent, foot planted ── */}
      <mesh position={[-0.22, 0.50, 0.0]} rotation={[-0.15, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.11, 0.58, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[-0.22, 0.14, 0.24]} rotation={[Math.PI * 0.28, 0, 0]}>
        <cylinderGeometry args={[0.10, 0.09, 0.52, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[-0.22, -0.03, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.14, 0.26, 0.1]} />
        <meshStandardMaterial color="#44261a" roughness={0.9} />
      </mesh>

      {/* ── TORSO ── */}
      <mesh position={[0, 0.88, 0.12]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.50, 0.60, 0.30]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.14, 0.13]}>
        <boxGeometry args={[0.28, 0.1, 0.28]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
      </mesh>

      {/* ── HEAD ── */}
      <mesh position={[0, 1.52, 0.10]}>
        <sphereGeometry args={[0.20, 12, 12]} />
        <meshStandardMaterial color="#c68642" roughness={0.6} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.67, 0.06]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#1c0a00" roughness={0.8} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.07, 1.52, 0.28]}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[-0.07, 1.52, 0.28]}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {/* Smile */}
      <mesh position={[0, 1.44, 0.28]}>
        <torusGeometry args={[0.055, 0.012, 4, 10, Math.PI]} />
        <meshBasicMaterial color="#7a3b19" />
      </mesh>

      {/* ── LEFT ARM — relaxed at side ── */}
      <mesh position={[-0.34, 0.96, 0.12]} rotation={[0.1, 0, -0.3]}>
        <cylinderGeometry args={[0.07, 0.065, 0.45, 8]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      <mesh position={[-0.44, 0.68, 0.14]} rotation={[0.15, 0, -0.15]}>
        <cylinderGeometry args={[0.06, 0.055, 0.38, 8]} />
        <meshStandardMaterial color="#c68642" roughness={0.6} />
      </mesh>

      {/* ── RIGHT ARM — animated (extends to offer rose) ── */}
      <mesh ref={armRef} position={[0.34, 1.00, 0.15]} rotation={[-0.55, 0, 0.22]}>
        <cylinderGeometry args={[0.07, 0.065, 0.46, 8]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      <mesh ref={forearmRef} position={[0.36, 0.82, 0.55]} rotation={[-0.80, 0, 0.12]}>
        <cylinderGeometry args={[0.06, 0.055, 0.42, 8]} />
        <meshStandardMaterial color="#c68642" roughness={0.6} />
      </mesh>
      {/* Right hand */}
      <mesh position={[0.36, 0.66, 0.92]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#c68642" roughness={0.6} />
      </mesh>

      {/* ── ROSE (animated group) ── */}
      <group ref={roseGroupRef} position={[0.36, 1.05, 0.95]}>
        {/* Stem */}
        <mesh rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.38, 6]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
        {/* Bloom center */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial color="#fb7185" />
        </mesh>
        {/* Outer petals */}
        {[0, 1, 2, 3, 4].map(i => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.06, 0.19, Math.sin(a) * 0.06]} rotation={[0.4, a, 0]}>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshBasicMaterial color="#f43f5e" />
            </mesh>
          );
        })}
        {/* Leaf */}
        <mesh position={[0.03, 0.04, 0.03]} rotation={[0.5, 0.8, 0]}>
          <coneGeometry args={[0.04, 0.12, 5]} />
          <meshBasicMaterial color="#16a34a" />
        </mesh>
        {/* Glow — brighter when presenting */}
        <pointLight color="#f43f5e" intensity={mode === 'presenting' ? 1.6 : 0.8} distance={2.5} decay={2} />
      </group>

      {/* ── RING BOX — on ground near knee ── */}
      <mesh position={[0.28, 0.01, 0.40]}>
        <boxGeometry args={[0.1, 0.07, 0.1]} />
        <meshStandardMaterial color="#292524" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.06, 0.34]} rotation={[-Math.PI / 3, 0, 0]}>
        <boxGeometry args={[0.1, 0.005, 0.1]} />
        <meshStandardMaterial color="#292524" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.06, 0.40]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      <pointLight position={[0.28, 0.1, 0.40]} color="#e0f2fe" intensity={0.4} distance={0.8} decay={2} />
    </group>
  );
};
