import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WalkControllerProps {
  active: boolean;
  moveInputRef: React.MutableRefObject<{ forward: number; strafe: number }>;
  lookDeltaRef: React.MutableRefObject<{ dx: number; dy: number }>;
  onProximityChange?: (spotName: string | null) => void;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
}

// Reuse Euler to avoid per-frame garbage collection
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

export const WalkController: React.FC<WalkControllerProps> = ({
  active,
  moveInputRef,
  lookDeltaRef,
  onProximityChange,
  playerPosRef
}) => {
  const { camera } = useThree();
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const yawRef = useRef<number>(Math.PI); // Face inward toward carnival
  const pitchRef = useRef<number>(-0.1);
  const isMouseDownRef = useRef<boolean>(false);
  const mousePrevPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSpotRef = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  // Initialize camera position once when explore starts
  useEffect(() => {
    if (active && !hasInitialized.current) {
      camera.position.set(0, 1.75, 32);
      yawRef.current = Math.PI; // face toward carnival (toward -Z)
      pitchRef.current = -0.08;
      hasInitialized.current = true;
      _euler.set(pitchRef.current, yawRef.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(_euler);
    }
    if (!active) {
      hasInitialized.current = false;
    }
  }, [active, camera]);

  // Keyboard and desktop mouse look
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left button only
        isMouseDownRef.current = true;
        mousePrevPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      yawRef.current -= (e.clientX - mousePrevPosRef.current.x) * 0.003;
      pitchRef.current = Math.max(-1.0, Math.min(0.6, pitchRef.current - (e.clientY - mousePrevPosRef.current.y) * 0.003));
      mousePrevPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isMouseDownRef.current = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [active]);

  useFrame((_, delta) => {
    if (!active) return;

    // Consume touch look deltas
    if (lookDeltaRef.current.dx !== 0 || lookDeltaRef.current.dy !== 0) {
      yawRef.current -= lookDeltaRef.current.dx;
      pitchRef.current = Math.max(-1.0, Math.min(0.6, pitchRef.current - lookDeltaRef.current.dy));
      lookDeltaRef.current.dx = 0;
      lookDeltaRef.current.dy = 0;
    }

    // Clamp delta to avoid huge jumps (e.g. tab switching)
    const dt = Math.min(delta, 0.05);

    let forward = moveInputRef.current.forward;
    let strafe = moveInputRef.current.strafe;

    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) forward += 1;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) forward -= 1;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) strafe -= 1;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) strafe += 1;

    // Normalize diagonal movement
    const len = Math.hypot(forward, strafe);
    if (len > 1) { forward /= len; strafe /= len; }

    if (forward !== 0 || strafe !== 0) {
      const speed = 8.0;
      const sinY = Math.sin(yawRef.current);
      const cosY = Math.cos(yawRef.current);
      camera.position.x += (sinY * forward + cosY * strafe) * speed * dt;
      camera.position.z += (-cosY * forward + sinY * strafe) * speed * dt;
      camera.position.x = Math.max(-34, Math.min(34, camera.position.x));
      camera.position.z = Math.max(-12, Math.min(40, camera.position.z));
    }

    camera.position.y = 1.75;
    playerPosRef.current.copy(camera.position);

    _euler.set(pitchRef.current, yawRef.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(_euler);

    // Proximity checks — only fire callback when spot changes
    const p = camera.position;
    let currentSpot: string | null = null;
    if (Math.hypot(p.x, p.z + 10.5) < 9) currentSpot = 'ferris';
    else if (Math.hypot(p.x + 24, p.z - 6) < 9) currentSpot = 'carousel';
    else if (Math.hypot(p.x - 24, p.z - 4) < 9) currentSpot = 'arcade';
    else if (Math.hypot(p.x - 22, p.z - 26) < 9) currentSpot = 'sweets';
    else if (Math.hypot(p.x + 23, p.z - 20) < 9) currentSpot = 'sweetsleft';

    if (currentSpot !== lastSpotRef.current) {
      lastSpotRef.current = currentSpot;
      if (onProximityChange) onProximityChange(currentSpot);
    }
  });

  return null;
};
