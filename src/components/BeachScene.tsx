import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Fireworks } from './Fireworks';
import { KneelingFigure } from './KneelingFigure';

interface BeachSceneProps {
  phase: 'welcome' | 'explore' | 'cinematic' | 'proposal' | 'celebrate';
  herName: string;
  yourName: string;
  onProposalSpotReached?: () => void;
}

// ─── Animated Ocean Water ───────────────────────────────────────────────────
const Ocean: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (matRef.current) {
      // Animate opacity to simulate shimmer
      const t = state.clock.getElapsedTime();
      matRef.current.opacity = 0.78 + 0.08 * Math.sin(t * 0.8);
    }
  });

  return (
    <group>
      {/* Main water plane */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, -80]}>
        <planeGeometry args={[300, 120, 1, 1]} />
        <meshStandardMaterial
          ref={matRef}
          color="#0d4f6b"
          roughness={0.2}
          metalness={0.4}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* Shallow surf band at shoreline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -15]}>
        <planeGeometry args={[200, 8]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.35} roughness={0.1} />
      </mesh>

      {/* Moonlight shimmer strip on ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, -55]}>
        <planeGeometry args={[12, 80]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.18} />
      </mesh>
    </group>
  );
};

// ─── Sandy Beach Ground ──────────────────────────────────────────────────────
const BeachGround: React.FC = () => {
  return (
    <group>
      {/* Main sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 10]} receiveShadow>
        <planeGeometry args={[160, 100]} />
        <meshStandardMaterial color="#c9a96e" roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Wet sand near water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, -10]}>
        <planeGeometry args={[160, 14]} />
        <meshStandardMaterial color="#a0845c" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ─── Palm Tree ───────────────────────────────────────────────────────────────
const PalmTree: React.FC<{ position: [number, number, number]; lean?: number; scale?: number }> = ({
  position,
  lean = 0,
  scale = 1
}) => {
  const leafColors = ['#15803d', '#166534', '#14532d'];
  return (
    <group position={position} rotation={[0, Math.random() * Math.PI, lean]} scale={scale}>
      {/* Trunk - slightly curved segments */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`trunk-${i}`} position={[i * 0.06, 1.1 + i * 1.4, 0]}>
          <cylinderGeometry args={[0.18 - i * 0.02, 0.22 - i * 0.01, 1.6, 8]} />
          <meshStandardMaterial color="#92400e" roughness={0.9} />
        </mesh>
      ))}
      {/* Fronds */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 7;
        const tilt = 0.45 + Math.random() * 0.2;
        return (
          <mesh
            key={`frond-${i}`}
            position={[Math.cos(angle) * 0.2, 7.8, Math.sin(angle) * 0.2]}
            rotation={[tilt, angle, 0]}
          >
            <coneGeometry args={[0.08, 2.8, 4]} />
            <meshStandardMaterial color={leafColors[i % 3]} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── Romantic Candle ─────────────────────────────────────────────────────────
const Candle: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (flameRef.current) {
      const t = state.clock.getElapsedTime();
      flameRef.current.scale.setScalar(0.85 + 0.25 * Math.sin(t * 6 + position[0]));
      flameRef.current.position.x = 0.02 * Math.sin(t * 4 + position[2]);
    }
  });

  return (
    <group position={position}>
      {/* Candle body */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.28, 8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      {/* Flame glow */}
      <mesh ref={flameRef} position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <pointLight position={[0, 0.35, 0]} color="#fbbf24" intensity={0.6} distance={2.5} decay={2} />
    </group>
  );
};

// ─── Rose Petal Path ─────────────────────────────────────────────────────────
const PetalPath: React.FC = () => {
  const petals = useMemo(() => {
    const pts = [];
    // Path from start (z=28) curving to proposal gazebo (z=-5)
    for (let i = 0; i < 55; i++) {
      const t = i / 54;
      const z = 28 - t * 32;
      const x = Math.sin(t * Math.PI * 1.2) * 1.8 + (Math.random() - 0.5) * 0.9;
      pts.push({ x, z, rot: Math.random() * Math.PI * 2, side: Math.random() > 0.5 });
    }
    return pts;
  }, []);

  return (
    <group>
      {petals.map((p, i) => (
        <mesh key={i} position={[p.x + (p.side ? 0.6 : -0.6), -0.18, p.z]} rotation={[-Math.PI / 2, 0, p.rot]}>
          <circleGeometry args={[0.08 + Math.random() * 0.06, 5]} />
          <meshBasicMaterial color={i % 3 === 0 ? '#f43f5e' : i % 3 === 1 ? '#fda4af' : '#fb7185'} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Proposal Gazebo / Romantic Arch ─────────────────────────────────────────
const ProposalGazebo: React.FC = () => {
  return (
    <group position={[0, 0, -5]}>
      {/* Two vertical arch poles */}
      {[-2.2, 2.2].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 3.6, 10]} />
          <meshStandardMaterial color="#7c3aed" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Arch top span */}
      <mesh position={[0, 3.7, 0]}>
        <torusGeometry args={[2.2, 0.09, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hanging fairy lights */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 13) * Math.PI;
        const lx = Math.cos(angle) * 2.2;
        const ly = 3.7 + Math.sin(angle) * 2.2;
        const colors = ['#fde68a', '#fb7185', '#a78bfa', '#6ee7b7'];
        return (
          <mesh key={`fl-${i}`} position={[lx, ly, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color={colors[i % 4]} />
          </mesh>
        );
      })}

      {/* Hanging drop fairy strings */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((dx, si) => (
        Array.from({ length: 4 }).map((_, di) => (
          <mesh key={`drop-${si}-${di}`} position={[dx, 3.4 - di * 0.4, -0.1]}>
            <sphereGeometry args={[0.04, 5, 5]} />
            <meshBasicMaterial color={si % 2 === 0 ? '#fde68a' : '#fb7185'} />
          </mesh>
        ))
      ))}

      {/* Ring of candles at base */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <Candle key={`c-${i}`} position={[Math.cos(angle) * 1.6, -0.05, Math.sin(angle) * 1.2]} />
        );
      })}

      {/* Soft romantic ring light */}
      <pointLight position={[0, 1.2, 0]} color="#fbbf24" intensity={2.2} distance={8} decay={2} />
      <pointLight position={[0, 3.5, 0]} color="#c084fc" intensity={1.4} distance={10} decay={2} />

      {/* Heart of rose petals on sand */}
      {Array.from({ length: 28 }).map((_, i) => {
        const t = (i / 28) * Math.PI * 2;
        const hx = 0.7 * (16 * Math.pow(Math.sin(t), 3)) * 0.085;
        const hz = -0.7 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.065;
        return (
          <mesh key={`hp-${i}`} position={[hx, -0.17, hz]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.07, 5]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        );
      })}

      {/* "Will you marry me?" sign */}
      <mesh position={[0, 2.2, 0.05]}>
        <boxGeometry args={[3.2, 0.55, 0.04]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      {/* Glowing border on sign */}
      <mesh position={[0, 2.2, 0.07]}>
        <boxGeometry args={[3.1, 0.45, 0.02]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>
    </group>
  );
};

// ─── Moon ────────────────────────────────────────────────────────────────────
const Moon: React.FC = () => (
  <group position={[18, 42, -90]}>
    <mesh>
      <sphereGeometry args={[6, 16, 16]} />
      <meshBasicMaterial color="#fef9c3" />
    </mesh>
    <pointLight color="#fef3c7" intensity={0.8} distance={250} decay={0.5} />
  </group>
);

// ─── Beach Boulders / Rocks ───────────────────────────────────────────────────
const Rocks: React.FC = () => {
  const rockData = useMemo(() => [
    { pos: [-18, -0.05, -8] as [number, number, number], s: [2.2, 0.9, 1.6] as [number, number, number] },
    { pos: [-16, -0.1, -6] as [number, number, number], s: [1.2, 0.7, 1.0] as [number, number, number] },
    { pos: [16, -0.1, -10] as [number, number, number], s: [2.0, 1.1, 1.4] as [number, number, number] },
    { pos: [19, -0.05, -7] as [number, number, number], s: [1.4, 0.8, 1.2] as [number, number, number] },
    { pos: [-22, -0.1, 5] as [number, number, number], s: [1.8, 1.0, 1.5] as [number, number, number] },
  ], []);

  return (
    <>
      {rockData.map((r, i) => (
        <mesh key={i} position={r.pos}>
          <boxGeometry args={r.s} />
          <meshStandardMaterial color="#78716c" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
};

// ─── Distant Palm Silhouettes ────────────────────────────────────────────────
const PalmRow: React.FC = () => (
  <>
    <PalmTree position={[-28, 0, 15]} lean={0.12} scale={1.3} />
    <PalmTree position={[-22, 0, 22]} lean={0.08} scale={1.0} />
    <PalmTree position={[-32, 0, 8]} lean={0.15} scale={1.5} />
    <PalmTree position={[26, 0, 18]} lean={-0.1} scale={1.2} />
    <PalmTree position={[30, 0, 10]} lean={-0.13} scale={1.4} />
    <PalmTree position={[22, 0, 25]} lean={-0.06} scale={0.95} />
    <PalmTree position={[0, 0, 38]} lean={0.05} scale={1.1} />
    <PalmTree position={[-8, 0, 36]} lean={0.07} scale={1.0} />
  </>
);

// ─── Main Beach Scene ────────────────────────────────────────────────────────
export const BeachScene: React.FC<BeachSceneProps> = ({ phase, herName, yourName }) => {
  const isProposal = phase === 'cinematic' || phase === 'proposal' || phase === 'celebrate';
  const isFireworks = phase === 'celebrate';
  // presenting = during cinematic + proposal, idle otherwise
  const figureMode: 'idle' | 'presenting' = (phase === 'cinematic' || phase === 'proposal' || phase === 'celebrate') ? 'presenting' : 'idle';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#1e3a5f" />
      <directionalLight position={[18, 42, -90]} intensity={0.5} color="#fef9c3" />

      {/* Night sky fog */}
      <fog attach="fog" args={['#060d1a', 35, 130]} />

      {/* Stars */}
      <Sparkles count={600} scale={[200, 80, 200]} size={1.8} speed={0.1} color="#e0f2fe" position={[0, 40, -30]} />
      {/* Tropical fireflies near beach */}
      <Sparkles count={60} scale={[30, 6, 30]} size={2.5} speed={0.6} color="#fde68a" position={[0, 2, 10]} />

      {/* Scene elements */}
      <Moon />
      <BeachGround />
      <Ocean />
      <PalmRow />
      <Rocks />
      <PetalPath />
      <ProposalGazebo />

      {/* Prashant kneeling with rose — always visible in the scene */}
      <KneelingFigure mode={figureMode} />

      {/* Fireworks over the ocean on celebrate */}
      <Fireworks active={isFireworks} intensity={1.6} />

      {/* Bloom only during proposal to keep exploration smooth */}
      {isProposal && (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.5} intensity={1.4} />
        </EffectComposer>
      )}
    </>
  );
};
