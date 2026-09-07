import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface LightMessageProps {
  herName: string;
  isRevealed: boolean;
  intensityMultiplier?: number;
}

// 5x7 font bitmap matrix for uppercase characters & heart
const FONT_MAP: Record<string, number[][]> = {
  ' ': [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
  ],
  'I': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,1,1,1,1],
  ],
  'L': [
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  'O': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  'V': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
  ],
  'E': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  'Y': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  'U': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  'A': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'B': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
  ],
  'C': [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,1,1,1],
  ],
  'D': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
  ],
  'F': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
  ],
  'G': [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
  ],
  'H': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'J': [
    [0,0,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [1,0,0,1,0],
    [0,1,1,0,0],
  ],
  'K': [
    [1,0,0,0,1],
    [1,0,0,1,0],
    [1,0,1,0,0],
    [1,1,0,0,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
  ],
  'M': [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'N': [
    [1,0,0,0,1],
    [1,1,0,0,1],
    [1,0,1,0,1],
    [1,0,0,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'P': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
  ],
  'Q': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,0,1,0],
    [0,1,1,0,1],
  ],
  'R': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
  ],
  'S': [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  'T': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  'W': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [1,0,0,0,1],
  ],
  'X': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,1,0,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'Z': [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  // Heart Icon ❤️ in 7x7 matrix
  '<3': [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ]
};

const getMatrixForChar = (char: string): number[][] => {
  const upper = char.toUpperCase();
  if (FONT_MAP[upper]) return FONT_MAP[upper];
  return FONT_MAP[' '];
};

interface BulbData {
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  scale: number;
}

export const LightMessage: React.FC<LightMessageProps> = ({
  herName,
  isRevealed,
  intensityMultiplier = 1
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowAnimRef = useRef({ progress: 0 });

  // Generate grid points oriented correctly for the top-down Ferris Wheel camera
  const bulbs = useMemo(() => {
    const list: BulbData[] = [];
    const line1 = "I LOVE YOU";
    const cleanName = herName.toUpperCase().trim();
    const line2 = `${cleanName} <3`;

    // Dynamic bulb spacing according to name length
    const bulbSpacing = cleanName.length > 8 ? 0.38 : 0.46;
    const charSpacing = cleanName.length > 8 ? 0.65 : 0.85;

    // Line 1 is top (higher Z), Line 2 is bottom (lower Z, closer to Ferris Wheel)
    const lines = [
      { text: line1, centerZ: 14.0, isSecondLine: false },
      { text: line2, centerZ: 6.5, isSecondLine: true }
    ];

    lines.forEach(({ text, centerZ, isSecondLine }) => {
      // Tokenize
      const tokens: string[] = [];
      let i = 0;
      while (i < text.length) {
        if (text.substring(i, i + 2) === '<3') {
          tokens.push('<3');
          i += 2;
        } else {
          tokens.push(text[i]);
          i++;
        }
      }

      // Calculate line total width
      let totalWidth = 0;
      tokens.forEach((char, idx) => {
        const matrix = char === '<3' ? FONT_MAP['<3'] : getMatrixForChar(char);
        const charCols = matrix[0].length;
        totalWidth += charCols * bulbSpacing + (idx < tokens.length - 1 ? charSpacing : 0);
      });

      let currentX = -totalWidth / 2;

      tokens.forEach((char) => {
        const matrix = char === '<3' ? FONT_MAP['<3'] : getMatrixForChar(char);
        const rows = matrix.length;
        const cols = matrix[0].length;
        const isHeart = char === '<3';

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (matrix[r][c] === 1) {
              // Left-to-Right: increasing X
              const x = currentX + c * bulbSpacing;
              // Top-to-Bottom: decreasing Z (so row 0 is top / higher Z, row 6 is bottom / lower Z)
              const z = centerZ + ((rows - 1) / 2 - r) * bulbSpacing;
              const y = 0.12;

              let color = new THREE.Color();
              if (isHeart) {
                color.setRGB(1.0, 0.05, 0.25); // Vibrant Ruby Red
              } else if (isSecondLine) {
                color.setRGB(1.0, 0.2, 0.55);  // Rose Pink
              } else {
                color.setRGB(1.0, 0.85, 0.3);  // Golden Warm Glow
              }

              list.push({
                x,
                y,
                z,
                color,
                scale: isHeart ? 1.25 : 1.0
              });
            }
          }
        }
        currentX += cols * bulbSpacing + charSpacing;
      });
    });

    return list;
  }, [herName]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!instancedMeshRef.current) return;
    const mesh = instancedMeshRef.current;

    bulbs.forEach((bulb, i) => {
      dummy.position.set(bulb.x, bulb.y, bulb.z);
      dummy.scale.set(bulb.scale, bulb.scale, bulb.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, bulb.color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [bulbs, dummy]);

  // GSAP Animation when apex reveal occurs
  useEffect(() => {
    if (isRevealed) {
      gsap.to(glowAnimRef.current, {
        progress: 1,
        duration: 2.2,
        ease: 'power2.out'
      });
    } else {
      glowAnimRef.current.progress = 0;
    }
  }, [isRevealed]);

  // Lightweight frame loop
  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isRevealed) {
      const pulse = 0.88 + 0.22 * Math.sin(t * 3.5);
      materialRef.current.opacity = Math.min(1.0, (0.4 + glowAnimRef.current.progress * 0.6) * pulse);
    } else {
      materialRef.current.opacity = 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* High performance instanced bulbs */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, bulbs.length]}
        castShadow={false}
        receiveShadow={false}
      >
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial
          ref={materialRef}
          color="#ffffff"
          transparent
          opacity={0.2}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Romantic Ground Halo Light beneath the message */}
      {isRevealed && (
        <pointLight
          position={[0, 1.5, 10]}
          color="#ff2e63"
          intensity={4.5 * intensityMultiplier}
          distance={22}
          decay={2}
        />
      )}
    </group>
  );
};
