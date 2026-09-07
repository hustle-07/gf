import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { soundEngine } from '../services/soundEngine';

interface FireworksProps {
  active: boolean;
  intensity?: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  decay: number;
}

interface Rocket {
  x: number;
  y: number;
  z: number;
  targetY: number;
  vy: number;
  color: THREE.Color;
  isHeart: boolean;
}

const MAX_PARTICLES = 1600;
const COLOR_PALETTES = [
  [new THREE.Color('#ff0055'), new THREE.Color('#ff758c'), new THREE.Color('#ffffff')], // Romantic Rose & White
  [new THREE.Color('#ffb703'), new THREE.Color('#fb8500'), new THREE.Color('#fff2b2')], // Golden Champagne
  [new THREE.Color('#7209b7'), new THREE.Color('#f72585'), new THREE.Color('#4cc9f0')], // Celestial Neon
  [new THREE.Color('#ff0a54'), new THREE.Color('#ff477e'), new THREE.Color('#ff85a1')], // Pure Ruby Heart
  [new THREE.Color('#00f5d4'), new THREE.Color('#7b2cbf'), new THREE.Color('#ff007f')], // Carnival Magic
];

export const Fireworks: React.FC<FireworksProps> = ({ active, intensity = 1.0 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const nextLaunchTimerRef = useRef<number>(0);

  // Buffer geometries for particle system
  const { positions, colors, sizes, alphas } = useMemo(() => {
    return {
      positions: new Float32Array(MAX_PARTICLES * 3),
      colors: new Float32Array(MAX_PARTICLES * 3),
      sizes: new Float32Array(MAX_PARTICLES),
      alphas: new Float32Array(MAX_PARTICLES),
    };
  }, []);

  // Launch a new firework rocket
  const launchFirework = () => {
    const startX = (Math.random() - 0.5) * 60;
    const startZ = -10 + (Math.random() - 0.5) * 35;
    const targetY = 32 + Math.random() * 22; // High in sky above Ferris wheel
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const primaryColor = palette[0];
    const isHeart = Math.random() > 0.45; // 55% chance for heart-shaped burst

    rocketsRef.current.push({
      x: startX,
      y: 0.5,
      z: startZ,
      targetY,
      vy: 28 + Math.random() * 8,
      color: primaryColor,
      isHeart
    });

    soundEngine.playFireworkLaunch();
  };

  // Explode rocket into thousands of glittering particles
  const explodeRocket = (rocket: Rocket) => {
    soundEngine.playFireworkExplosion();

    if (flashLightRef.current) {
      flashLightRef.current.position.set(rocket.x, rocket.y, rocket.z);
      flashLightRef.current.color = rocket.color;
      flashLightRef.current.intensity = 15;
    }

    const particleCount = rocket.isHeart ? 160 : 120;
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

    for (let i = 0; i < particleCount; i++) {
      if (particlesRef.current.length >= MAX_PARTICLES) {
        particlesRef.current.shift(); // Recycle oldest
      }

      let vx = 0;
      let vy = 0;
      let vz = 0;

      if (rocket.isHeart) {
        // Parametric 3D Heart curve: x = 16 sin^3(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
        const t = Math.random() * Math.PI * 2;
        const scale = 0.55 + Math.random() * 0.25;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const hz = (Math.random() - 0.5) * 6;

        vx = (hx * scale) * 0.9;
        vy = (hy * scale) * 0.9;
        vz = hz;
      } else {
        // Spherical explosion burst
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();
        const speed = 7 + Math.random() * 12;

        vx = speed * Math.sin(phi) * Math.cos(theta);
        vy = speed * Math.sin(phi) * Math.sin(theta);
        vz = speed * Math.cos(phi);
      }

      const color = palette[Math.floor(Math.random() * palette.length)];

      particlesRef.current.push({
        x: rocket.x,
        y: rocket.y,
        z: rocket.z,
        vx,
        vy,
        vz,
        color,
        size: 0.6 + Math.random() * 0.8,
        alpha: 1.0,
        life: 0,
        maxLife: 1.6 + Math.random() * 1.2,
        decay: 0.965 + Math.random() * 0.02
      });
    }
  };

  // Initial burst when fireworks activate
  useEffect(() => {
    if (active) {
      launchFirework();
      const timeout = setTimeout(() => launchFirework(), 400);
      const timeout2 = setTimeout(() => launchFirework(), 850);
      return () => {
        clearTimeout(timeout);
        clearTimeout(timeout2);
      };
    }
  }, [active]);

  useFrame((_, delta) => {
    // Spawning timer
    if (active) {
      nextLaunchTimerRef.current -= delta;
      if (nextLaunchTimerRef.current <= 0) {
        launchFirework();
        // Fire bursts every 0.6 to 1.8 seconds depending on intensity
        nextLaunchTimerRef.current = (0.7 + Math.random() * 0.9) / intensity;
      }
    }

    // Fade flash light
    if (flashLightRef.current && flashLightRef.current.intensity > 0) {
      flashLightRef.current.intensity = THREE.MathUtils.lerp(flashLightRef.current.intensity, 0, delta * 5);
    }

    // Update ascending rockets
    for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
      const rocket = rocketsRef.current[i];
      rocket.y += rocket.vy * delta;

      // Rocket trail particles
      if (particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push({
          x: rocket.x + (Math.random() - 0.5) * 0.3,
          y: rocket.y,
          z: rocket.z + (Math.random() - 0.5) * 0.3,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -2 - Math.random() * 3,
          vz: (Math.random() - 0.5) * 0.8,
          color: new THREE.Color('#ffe494'),
          size: 0.45,
          alpha: 0.9,
          life: 0,
          maxLife: 0.4,
          decay: 0.9
        });
      }

      if (rocket.y >= rocket.targetY) {
        explodeRocket(rocket);
        rocketsRef.current.splice(i, 1);
      }
    }

    // Update particles physics & lifespan
    const gravity = -9.8;
    const airDrag = 0.975;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      // Physics update
      p.vx *= airDrag;
      p.vy = (p.vy + gravity * delta) * airDrag;
      p.vz *= airDrag;

      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;

      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }

    // Update GPU vertex buffers
    if (pointsRef.current) {
      const pCount = particlesRef.current.length;
      for (let i = 0; i < pCount; i++) {
        const p = particlesRef.current[i];
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;

        colors[i * 3] = p.color.r * (1 + p.alpha);
        colors[i * 3 + 1] = p.color.g * (1 + p.alpha);
        colors[i * 3 + 2] = p.color.b * (1 + p.alpha);

        sizes[i] = p.size * (0.8 + p.alpha * 0.6);
        alphas[i] = p.alpha;
      }

      // Clear remaining slots
      for (let i = pCount; i < MAX_PARTICLES; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -100;
        positions[i * 3 + 2] = 0;
        alphas[i] = 0;
      }

      const geom = pointsRef.current.geometry;
      geom.attributes.position.needsUpdate = true;
      geom.attributes.color.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Sky Flash Point Light on Detonation */}
      <pointLight
        ref={flashLightRef}
        position={[0, 35, 0]}
        color="#ff758c"
        intensity={0}
        distance={120}
        decay={1.8}
      />

      {/* Particle System Points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.65}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
};
