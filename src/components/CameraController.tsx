import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface CameraControllerProps {
  phase: 'welcome' | 'explore' | 'boarding' | 'riding' | 'apex' | 'proposal' | 'celebrate';
  cabinPos: THREE.Vector3;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onApexReached?: () => void;
  onProposalReady?: () => void;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  phase,
  cabinPos,
  playerPosRef,
  onApexReached,
  onProposalReady
}) => {
  const { camera } = useThree();
  const lookAtTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, -14));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, -14));
  const isTransitioningRef = useRef<boolean>(false);

  // Handle phase transitions
  useEffect(() => {
    if (phase === 'welcome') {
      camera.position.set(0, 5, 34);
      lookAtTargetRef.current.set(0, 10, -14);
      camera.lookAt(lookAtTargetRef.current);
    } else if (phase === 'boarding') {
      isTransitioningRef.current = true;
      // Fly smoothly from player walk position into Ferris Wheel cabin
      gsap.to(camera.position, {
        x: 0,
        y: 3.2,
        z: -11.8,
        duration: 3.0,
        ease: 'power2.inOut',
        onComplete: () => {
          isTransitioningRef.current = false;
        }
      });
      gsap.to(lookAtTargetRef.current, {
        x: 0,
        y: 3.2,
        z: 15,
        duration: 3.0,
        ease: 'power2.inOut'
      });
    } else if (phase === 'riding') {
      isTransitioningRef.current = false;
    } else if (phase === 'apex') {
      isTransitioningRef.current = true;
      // Tilt downward to overlook the lawn and light message
      gsap.to(camera.position, {
        x: 0,
        y: 35.5,
        z: -11.5,
        duration: 3.2,
        ease: 'power2.inOut',
        onComplete: () => {
          isTransitioningRef.current = false;
          if (onApexReached) onApexReached();
        }
      });
      gsap.to(lookAtTargetRef.current, {
        x: 0,
        y: 0.5,
        z: 8,
        duration: 3.2,
        ease: 'power2.inOut'
      });
    } else if (phase === 'proposal' || phase === 'celebrate') {
      isTransitioningRef.current = true;
      // Wide view capturing lawn message and fireworks in sky
      gsap.to(camera.position, {
        x: 0,
        y: 31,
        z: -5,
        duration: 2.8,
        ease: 'power2.out',
        onComplete: () => {
          isTransitioningRef.current = false;
          if (onProposalReady) onProposalReady();
        }
      });
      gsap.to(lookAtTargetRef.current, {
        x: 0,
        y: 9,
        z: 12,
        duration: 2.8,
        ease: 'power2.out'
      });
    }
  }, [phase, camera, onApexReached, onProposalReady]);

  // Frame update loop
  useFrame((_, delta) => {
    if (phase === 'explore') {
      // Camera controlled by WalkController
      return;
    }

    if (phase === 'riding' && !isTransitioningRef.current) {
      const targetCamPos = new THREE.Vector3(
        cabinPos.x,
        cabinPos.y + 0.3,
        cabinPos.z + 1.6
      );
      camera.position.lerp(targetCamPos, delta * 4);

      const progress = Math.min(1.0, Math.max(0, (cabinPos.y - 4) / 30));
      const targetLook = new THREE.Vector3(
        0,
        THREE.MathUtils.lerp(12, 1.0, progress),
        THREE.MathUtils.lerp(-10, 8, progress)
      );
      lookAtTargetRef.current.lerp(targetLook, delta * 3);
    }

    currentLookAtRef.current.lerp(lookAtTargetRef.current, delta * 5);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
};
