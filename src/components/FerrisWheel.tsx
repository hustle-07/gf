import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FerrisWheelProps {
  position?: [number, number, number];
  rotationSpeed?: number;
  onCabinPositionUpdate?: (cabinWorldPos: THREE.Vector3, cabinAngle: number) => void;
  isRiding?: boolean;
}

const CABIN_COUNT = 12;
const WHEEL_RADIUS = 16;
const HUB_HEIGHT = 19;

export const FerrisWheel: React.FC<FerrisWheelProps> = ({
  position = [0, 0, -15],
  rotationSpeed = 0.08,
  onCabinPositionUpdate,
  isRiding = false
}) => {
  const wheelGroupRef = useRef<THREE.Group>(null);
  const cabinsRef = useRef<THREE.Group[]>([]);
  const currentAngleRef = useRef<number>(0);
  const targetCabinPos = useMemo(() => new THREE.Vector3(), []);

  // Construct Ferris Wheel geometry: Rim, Spokes, Hub, Support Pillars, and Cabins
  useFrame((_, delta) => {
    if (!wheelGroupRef.current) return;

    // Smoothly rotate the wheel
    const speed = isRiding ? rotationSpeed * 1.3 : rotationSpeed;
    currentAngleRef.current += speed * delta;
    wheelGroupRef.current.rotation.z = currentAngleRef.current;

    // Counter-rotate cabins so they always hang vertically upright under gravity
    cabinsRef.current.forEach((cabin, idx) => {
      if (cabin) {
        cabin.rotation.z = -currentAngleRef.current;
        // Track the bottom cabin (index 0) which rides to the apex
        if (idx === 0 && onCabinPositionUpdate) {
          cabin.getWorldPosition(targetCabinPos);
          onCabinPositionUpdate(targetCabinPos, currentAngleRef.current);
        }
      }
    });
  });

  // Calculate cabin positions along the perimeter
  const cabinAngles = useMemo(() => {
    return Array.from({ length: CABIN_COUNT }).map((_, i) => (i * 2 * Math.PI) / CABIN_COUNT);
  }, []);

  return (
    <group position={position}>
      {/* --- Support Structure (A-Frame Towers) --- */}
      {/* Front and Back Support Legs */}
      {[-2.8, 2.8].map((zOffset, zIdx) => (
        <group key={`support-side-${zIdx}`} position={[0, 0, zOffset]}>
          {/* Left Leg */}
          <mesh position={[-6, HUB_HEIGHT / 2, 0]} rotation={[0, 0, -0.32]} castShadow>
            <cylinderGeometry args={[0.32, 0.45, HUB_HEIGHT + 2, 16]} />
            <meshStandardMaterial color="#2d2238" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Right Leg */}
          <mesh position={[6, HUB_HEIGHT / 2, 0]} rotation={[0, 0, 0.32]} castShadow>
            <cylinderGeometry args={[0.32, 0.45, HUB_HEIGHT + 2, 16]} />
            <meshStandardMaterial color="#2d2238" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Cross Braces */}
          <mesh position={[0, HUB_HEIGHT * 0.45, 0]}>
            <boxGeometry args={[7.5, 0.25, 0.35]} />
            <meshStandardMaterial color="#e11d48" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, HUB_HEIGHT * 0.72, 0]}>
            <boxGeometry args={[4.2, 0.25, 0.35]} />
            <meshStandardMaterial color="#e11d48" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Center Axle / Hub Axis */}
      <mesh position={[0, HUB_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 6.4, 32]} />
        <meshStandardMaterial color="#f6d365" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Hub Center Glowing Caps */}
      {[-3.3, 3.3].map((z, i) => (
        <mesh key={`hub-cap-${i}`} position={[0, HUB_HEIGHT, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.3, 32]} />
          <meshStandardMaterial color="#ff2a6d" emissive="#ff2a6d" emissiveIntensity={2.5} />
        </mesh>
      ))}

      {/* --- Rotating Wheel Core --- */}
      <group ref={wheelGroupRef} position={[0, HUB_HEIGHT, 0]}>
        {/* Double Outer Rings (Front & Back) */}
        {[-2.2, 2.2].map((zRing, ringIdx) => (
          <group key={`rim-${ringIdx}`} position={[0, 0, zRing]}>
            {/* Outer Rim Tube */}
            <mesh>
              <torusGeometry args={[WHEEL_RADIUS, 0.22, 16, 64]} />
              <meshStandardMaterial color="#ffe4e6" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Inner Concentric Rim */}
            <mesh>
              <torusGeometry args={[WHEEL_RADIUS * 0.75, 0.16, 16, 48]} />
              <meshStandardMaterial color="#f43f5e" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Glowing Neon Fairy Rim Light Ring */}
            <mesh>
              <torusGeometry args={[WHEEL_RADIUS + 0.05, 0.08, 12, 64]} />
              <meshStandardMaterial
                color="#f6d365"
                emissive="#f6d365"
                emissiveIntensity={2.8}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Connecting struts between front and back rims */}
        {cabinAngles.map((angle, idx) => {
          const x = Math.cos(angle) * WHEEL_RADIUS;
          const y = Math.sin(angle) * WHEEL_RADIUS;
          return (
            <mesh key={`cross-strut-${idx}`} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 4.4, 12]} />
              <meshStandardMaterial color="#f6d365" metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}

        {/* Spokes linking hub to rims with sparkling lights */}
        {cabinAngles.map((angle, idx) => {
          return (
            <group key={`spoke-pair-${idx}`} rotation={[0, 0, angle]}>
              {/* Spoke Rods */}
              {[-2.2, 2.2].map((zPos, sIdx) => (
                <mesh key={`spoke-${sIdx}`} position={[WHEEL_RADIUS / 2, 0, zPos]}>
                  <boxGeometry args={[WHEEL_RADIUS, 0.09, 0.09]} />
                  <meshStandardMaterial color="#e11d48" metalness={0.7} roughness={0.3} />
                </mesh>
              ))}

              {/* Glowing Spoke Mid-point Fairy Bulb */}
              <mesh position={[WHEEL_RADIUS * 0.5, 0, 0]}>
                <sphereGeometry args={[0.22, 12, 12]} />
                <meshStandardMaterial
                  color={idx % 2 === 0 ? "#ff2a6d" : "#05d9e8"}
                  emissive={idx % 2 === 0 ? "#ff2a6d" : "#05d9e8"}
                  emissiveIntensity={2.2}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}

        {/* --- 12 Suspended Cabins (Gondolas) --- */}
        {cabinAngles.map((angle, idx) => {
          const x = Math.cos(angle) * WHEEL_RADIUS;
          const y = Math.sin(angle) * WHEEL_RADIUS;
          const isPlayerCabin = idx === 0;

          return (
            <group
              key={`cabin-mount-${idx}`}
              position={[x, y, 0]}
              ref={(el) => {
                if (el) cabinsRef.current[idx] = el;
              }}
            >
              {/* Cabin Suspension Arm / Yoke */}
              <mesh position={[0, -0.6, 0]}>
                <boxGeometry args={[0.12, 1.2, 3.6]} />
                <meshStandardMaterial color="#f6d365" metalness={0.8} />
              </mesh>

              {/* Cabin Body Container */}
              <group position={[0, -2.1, 0]}>
                {/* Main Roof Dome */}
                <mesh position={[0, 1.1, 0]}>
                  <cylinderGeometry args={[1.4, 1.6, 0.45, 18]} />
                  <meshStandardMaterial
                    color={isPlayerCabin ? "#e11d48" : "#2d2238"}
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>

                {/* Roof Crown / Neon Finial */}
                <mesh position={[0, 1.45, 0]}>
                  <sphereGeometry args={[0.22, 12, 12]} />
                  <meshStandardMaterial
                    color="#f6d365"
                    emissive="#f6d365"
                    emissiveIntensity={isPlayerCabin ? 3.5 : 1.8}
                    toneMapped={false}
                  />
                </mesh>

                {/* Glass Window Enclosure (Translucent Romantic Glass) */}
                <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[1.45, 1.45, 1.4, 18]} />
                  <meshPhysicalMaterial
                    color={isPlayerCabin ? "#ffccd5" : "#d1e8ff"}
                    transparent
                    opacity={0.35}
                    roughness={0.1}
                    transmission={0.65}
                    thickness={0.5}
                  />
                </mesh>

                {/* Cabin Lower Base Carriage */}
                <mesh position={[0, -0.7, 0]}>
                  <cylinderGeometry args={[1.5, 1.25, 0.7, 18]} />
                  <meshStandardMaterial
                    color={isPlayerCabin ? "#9f1239" : "#1a162b"}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>

                {/* Romantic Interior Seat & Warm Lantern */}
                <mesh position={[0, -0.3, 0]}>
                  <boxGeometry args={[0.9, 0.2, 1.6]} />
                  <meshStandardMaterial color="#881337" roughness={0.8} />
                </mesh>

                {/* Glowing Proposal Lantern inside cabin */}
                <mesh position={[0, 0.1, 0]}>
                  <sphereGeometry args={[0.16, 12, 12]} />
                  <meshStandardMaterial
                    color="#fff2b2"
                    emissive="#ffb703"
                    emissiveIntensity={isPlayerCabin ? 4.0 : 1.5}
                    toneMapped={false}
                  />
                </mesh>

                {/* Cabin Point Light illuminating interior */}
                <pointLight
                  position={[0, 0.2, 0]}
                  color={isPlayerCabin ? "#ffe4e6" : "#fef08a"}
                  intensity={isPlayerCabin ? 3.5 : 1.2}
                  distance={6}
                  decay={2}
                />
              </group>
            </group>
          );
        })}
      </group>

      {/* Boarding Platform at Ground */}
      <group position={[0, 0.8, 3.2]}>
        {/* Wooden / Steel Deck */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[12, 0.6, 6]} />
          <meshStandardMaterial color="#382923" roughness={0.8} />
        </mesh>
        {/* Guard Rails with Warm Fairy Lights */}
        {[-5.8, 5.8].map((rx, rIdx) => (
          <mesh key={`rail-${rIdx}`} position={[rx, 0.7, 0]}>
            <boxGeometry args={[0.1, 0.8, 5.8]} />
            <meshStandardMaterial color="#f6d365" metalness={0.7} />
          </mesh>
        ))}
        {/* Platform Archway */}
        <mesh position={[0, 2.4, 2.8]}>
          <boxGeometry args={[5.2, 0.25, 0.25]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2.0} />
        </mesh>
      </group>
    </group>
  );
};
