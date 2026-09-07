import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BeachWalkControllerProps {
  active: boolean;
  moveInputRef: React.MutableRefObject<{ forward: number; strafe: number }>;
  lookDeltaRef: React.MutableRefObject<{ dx: number; dy: number }>;
  onProposalSpotReached?: () => void;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
}

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

export const BeachWalkController: React.FC<BeachWalkControllerProps> = ({
  active,
  moveInputRef,
  lookDeltaRef,
  onProposalSpotReached,
  playerPosRef
}) => {
  const { camera } = useThree();
  const keysRef = useRef<Record<string, boolean>>({});

  // yaw=0 → camera faces -Z (toward gazebo at z=-5 from start z=32) — CORRECT direction
  const yawRef = useRef<number>(0);
  const pitchRef = useRef<number>(-0.05);
  const hasInit = useRef(false);
  const proposalFiredRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const mousePrevRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (active && !hasInit.current) {
      camera.position.set(0, 1.75, 32);
      yawRef.current = 0;   // Face toward -Z = toward the ocean and gazebo
      pitchRef.current = -0.05;
      hasInit.current = true;
      _euler.set(pitchRef.current, yawRef.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(_euler);
    }
    if (!active) {
      hasInit.current = false;
      proposalFiredRef.current = false;
    }
  }, [active, camera]);

  useEffect(() => {
    if (!active) return;
    const kd = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const ku = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    const md = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = true;
        mousePrevRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    const mm = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      yawRef.current -= (e.clientX - mousePrevRef.current.x) * 0.003;
      pitchRef.current = Math.max(-0.9, Math.min(0.5, pitchRef.current - (e.clientY - mousePrevRef.current.y) * 0.003));
      mousePrevRef.current = { x: e.clientX, y: e.clientY };
    };
    const mu = () => { isMouseDownRef.current = false; };

    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
  }, [active]);

  useFrame((_, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.05);

    if (lookDeltaRef.current.dx !== 0 || lookDeltaRef.current.dy !== 0) {
      yawRef.current -= lookDeltaRef.current.dx;
      pitchRef.current = Math.max(-0.9, Math.min(0.5, pitchRef.current - lookDeltaRef.current.dy));
      lookDeltaRef.current.dx = 0;
      lookDeltaRef.current.dy = 0;
    }

    let fwd = moveInputRef.current.forward;
    let str = moveInputRef.current.strafe;
    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp'])    fwd += 1;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown'])  fwd -= 1;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft'])  str -= 1;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) str += 1;

    const len = Math.hypot(fwd, str);
    if (len > 1) { fwd /= len; str /= len; }

    if (fwd !== 0 || str !== 0) {
      const speed = 7.0;
      const sinY = Math.sin(yawRef.current);
      const cosY = Math.cos(yawRef.current);
      // Standard FPS: fwd moves along -Z at yaw=0
      camera.position.x += (sinY * fwd + cosY * str) * speed * dt;
      camera.position.z += (-cosY * fwd + sinY * str) * speed * dt;
      camera.position.x = Math.max(-30, Math.min(30, camera.position.x));
      camera.position.z = Math.max(-13, Math.min(36, camera.position.z));
    }

    camera.position.y = 1.75;
    playerPosRef.current.copy(camera.position);

    _euler.set(pitchRef.current, yawRef.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(_euler);

    // Trigger proposal when player enters gazebo area
    if (!proposalFiredRef.current) {
      const distToGazebo = Math.hypot(camera.position.x, camera.position.z - (-5));
      if (distToGazebo < 5.5) {
        proposalFiredRef.current = true;
        if (onProposalSpotReached) onProposalSpotReached();
      }
    }
  });

  return null;
};
