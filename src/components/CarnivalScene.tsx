import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FerrisWheel } from './FerrisWheel';
import { LightMessage } from './LightMessage';
import { Fireworks } from './Fireworks';

interface CarnivalSceneProps {
  phase: 'welcome' | 'explore' | 'boarding' | 'riding' | 'apex' | 'proposal' | 'celebrate';
  herName: string;
  yourName: string;
  onCabinPositionUpdate: (pos: THREE.Vector3, angle?: number) => void;
}

// Grand Carnival Entrance Archway
const GrandEntranceArch: React.FC = () => {
  return (
    <group position={[0, 0, 36]}>
      {[-7, 7].map((px, idx) => (
        <group key={`arch-pillar-${idx}`} position={[px, 0, 0]}>
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.7, 0.9, 6.4, 12]} />
            <meshStandardMaterial color="#881337" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 6.5, 0]}>
            <sphereGeometry args={[0.6, 10, 10]} />
            <meshBasicMaterial color="#f6d365" />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 6.8, 0]}>
        <boxGeometry args={[15, 1.2, 0.8]} />
        <meshStandardMaterial color="#9f1239" metalness={0.4} />
      </mesh>

      <mesh position={[0, 6.8, 0.45]}>
        <boxGeometry args={[13.5, 0.9, 0.1]} />
        <meshBasicMaterial color="#ff0055" />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`arch-light-${i}`} position={[-5.5 + i * 1.0, 7.5, 0]}>
          <sphereGeometry args={[0.14, 6, 6]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#ffd166" : "#06d6a0"} />
        </mesh>
      ))}
    </group>
  );
};

// Balloon Pop Booth
const BalloonPopBooth: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({
  position,
  rotationY = 0
}) => {
  const balloonColors = ['#ff0055', '#06d6a0', '#ffd166', '#118ab2', '#ff477e', '#7b2cbf'];

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[5, 3.2, 3.4]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.0, 1.0]}>
        <boxGeometry args={[4.6, 1.0, 1.2]} />
        <meshStandardMaterial color="#312e81" />
      </mesh>
      <mesh position={[0, 3.4, 0.2]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[5.4, 0.25, 3.8]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.9, 0.6]}>
        <boxGeometry args={[4.2, 0.6, 0.1]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <group position={[0, 2.0, -0.6]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.2, 2.0, 0.1]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const bx = -1.2 + col * 0.8;
          const by = -0.5 + row * 0.55;
          const color = balloonColors[i % balloonColors.length];
          return (
            <mesh key={`balloon-${i}`} position={[bx, by, 0.15]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          );
        })}
      </group>
      {[-1.2, 1.2].map((tx, idx) => (
        <group key={`bear-${idx}`} position={[tx, 1.7, 0.8]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Sweet Food & Popcorn Cart
const SweetShopCart: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({
  position,
  rotationY = 0
}) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[4.2, 2.2, 2.5]} />
        <meshStandardMaterial color="#881337" metalness={0.3} roughness={0.5} />
      </mesh>
      {[-1.8, 1.8].map((wx, idx) => (
        <mesh key={`wheel-${idx}`} position={[wx, 0.6, 1.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.6, 0.6, 0.12, 12]} />
          <meshStandardMaterial color="#f6d365" metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3.8, 1.0, 2.0]} />
        <meshBasicMaterial color="#ffccd5" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 3.4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.0, 1.0, 4]} />
        <meshStandardMaterial color="#fda4af" />
      </mesh>
      <mesh position={[0, 3.2, 1.2]}>
        <boxGeometry args={[3.2, 0.5, 0.1]} />
        <meshBasicMaterial color="#ff007f" />
      </mesh>
    </group>
  );
};

// Street Lamp
const StreetLamp: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 4.4, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial color="#fff4cc" />
      </mesh>
    </group>
  );
};

// Park Bench
const ParkBench: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({
  position,
  rotationY = 0
}) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.4, 0.1, 0.7]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, -0.3]}>
        <boxGeometry args={[2.4, 0.6, 0.08]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Carousel
const Carousel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const spinningGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spinningGroupRef.current) {
      spinningGroupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[5.2, 5.5, 0.8, 16]} />
        <meshStandardMaterial color="#881337" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 5, 12]} />
        <meshStandardMaterial color="#f6d365" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={spinningGroupRef} position={[0, 0, 0]}>
        <mesh position={[0, 5.8, 0]}>
          <coneGeometry args={[5.8, 2.2, 16]} />
          <meshStandardMaterial color="#e11d48" metalness={0.3} roughness={0.3} />
        </mesh>
        <mesh position={[0, 7.2, 0]}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshBasicMaterial color="#f6d365" />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 6;
          const radius = 3.6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <group key={`horse-${i}`} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <mesh position={[0, 2.8, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 4.8, 6]} />
                <meshStandardMaterial color="#f6d365" metalness={0.7} />
              </mesh>
              <group position={[0, 1.8 + Math.sin(i + 1) * 0.4, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.4, 0.5, 1.2]} />
                  <meshStandardMaterial color={i % 2 === 0 ? "#fff1f2" : "#3b2d54"} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};

export const CarnivalScene: React.FC<CarnivalSceneProps> = ({
  phase,
  herName,
  yourName,
  onCabinPositionUpdate
}) => {
  const isApexOrProposal = phase === 'apex' || phase === 'proposal' || phase === 'celebrate';
  const isFireworksActive = phase === 'proposal' || phase === 'celebrate';

  return (
    <>
      <ambientLight intensity={isApexOrProposal ? 0.4 : 0.6} color="#1e1b4b" />
      <directionalLight position={[20, 35, 20]} intensity={0.7} color="#c7d2fe" />
      <fog attach="fog" args={['#070512', 30, 120]} />

      <Sparkles count={250} scale={[120, 50, 120]} size={2.2} speed={0.2} color="#e0e7ff" position={[0, 30, 0]} />
      <Sparkles count={80} scale={[40, 8, 40]} size={2.6} speed={0.4} color="#fb7185" position={[0, 3, 10]} />

      {/* Ground Lawn */}
      <group position={[0, -0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[180, 180]} />
          <meshStandardMaterial color="#080712" roughness={0.9} metalness={0.1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 10]}>
          <ringGeometry args={[14, 28, 24]} />
          <meshStandardMaterial color="#1a1528" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 22]}>
          <planeGeometry args={[7, 30]} />
          <meshStandardMaterial color="#1e1830" roughness={0.7} />
        </mesh>
      </group>

      <GrandEntranceArch />
      <FerrisWheel
        position={[0, 0, -14]}
        isRiding={phase === 'riding' || phase === 'apex' || phase === 'proposal' || phase === 'celebrate'}
        onCabinPositionUpdate={onCabinPositionUpdate}
      />
      <Carousel position={[-24, 0, 6]} />
      <BalloonPopBooth position={[24, 0, 4]} rotationY={-0.5} />
      <SweetShopCart position={[-23, 0, 20]} rotationY={0.6} />
      <SweetShopCart position={[22, 0, 26]} rotationY={-0.6} />

      {[-4.2, 4.2].map((lx, idx) => (
        <group key={`walkway-lamps-${idx}`}>
          <StreetLamp position={[lx, 0, 32]} />
          <StreetLamp position={[lx, 0, 20]} />
          <StreetLamp position={[lx, 0, 8]} />
        </group>
      ))}

      <ParkBench position={[-5.5, 0, 24]} rotationY={Math.PI / 2} />
      <ParkBench position={[5.5, 0, 24]} rotationY={-Math.PI / 2} />

      <LightMessage
        herName={herName}
        isRevealed={isApexOrProposal}
        intensityMultiplier={phase === 'celebrate' ? 1.4 : 1.0}
      />

      <Fireworks
        active={isFireworksActive}
        intensity={phase === 'celebrate' ? 1.8 : 1.0}
      />

      {/* Bloom only active during apex & proposal */}
      {isApexOrProposal && (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.6} intensity={1.5} />
        </EffectComposer>
      )}
    </>
  );
};
