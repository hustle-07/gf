import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';
import { BeachScene } from './components/BeachScene';
import { BeachWalkController } from './components/BeachWalkController';
import { MobileJoystick } from './components/MobileJoystick';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProposalOverlay } from './components/ProposalOverlay';
import { CinematicSequence } from './components/CinematicSequence';
import { soundEngine } from './services/soundEngine';

// Full phase flow: welcome → explore → cinematic → proposal → celebrate
export type AppPhase = 'welcome' | 'explore' | 'cinematic' | 'proposal' | 'celebrate';

export const App: React.FC = () => {
  const herName = "Raj Nandani";
  const yourName = "Prashant";

  const [phase, setPhase] = useState<AppPhase>('welcome');
  const [isMuted, setIsMuted] = useState(false);

  const moveInputRef = useRef<{ forward: number; strafe: number }>({ forward: 0, strafe: 0 });
  const lookDeltaRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.75, 32));

  const triggerFullscreen = () => {
    try {
      const el = document.documentElement as any;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (_) {}
  };

  const handleEnterBeach = () => {
    triggerFullscreen();
    soundEngine.startCarnivalMusic();
    setPhase('explore');
  };

  const handleToggleMute = () => {
    setIsMuted(soundEngine.toggleMute());
  };

  // Step 1 — player walks to gazebo → start cinematic rose-giving sequence
  const handleProposalSpotReached = useCallback(() => {
    soundEngine.playMessageRevealChime();
    setPhase('cinematic');
  }, []);

  // Step 2 — cinematic sequence finishes → show proposal popup
  const handleCinematicComplete = useCallback(() => {
    soundEngine.playProposalChime();
    setPhase('proposal');
  }, []);

  const isExploring = phase === 'explore';

  return (
    <div
      className="relative overflow-hidden bg-black font-sans select-none"
      style={{ width: '100vw', height: '100dvh', touchAction: 'none', userSelect: 'none' }}
    >
      {/* 3D Canvas — always rendered so scene is visible during cinematic */}
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 1.75, 32], fov: 65, near: 0.1, far: 240 }}
        dpr={1}
        frameloop="always"
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: true }}
      >
        {/* Walk only during explore — stops on cinematic so camera freezes dramatically */}
        <BeachWalkController
          active={isExploring}
          moveInputRef={moveInputRef}
          lookDeltaRef={lookDeltaRef}
          onProposalSpotReached={handleProposalSpotReached}
          playerPosRef={playerPosRef}
        />
        <BeachScene
          phase={phase}
          herName={herName}
          yourName={yourName}
        />
      </Canvas>

      {/* Mobile Joystick — only while walking */}
      <MobileJoystick
        visible={isExploring}
        moveInputRef={moveInputRef}
        lookDeltaRef={lookDeltaRef}
      />

      {/* Welcome Screen */}
      {phase === 'welcome' && (
        <WelcomeScreen herName={herName} yourName={yourName} onEnter={handleEnterBeach} />
      )}

      {/* HUD — top bar (during all non-welcome phases) */}
      {phase !== 'welcome' && phase !== 'cinematic' && (
        <div className="fixed top-3 sm:top-5 left-0 right-0 z-30 px-3 sm:px-5 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-none glass-panel px-3 py-1.5 rounded-full border border-sky-500/20 text-[11px] sm:text-xs text-sky-200">
            {phase === 'explore' && '🌊 Follow the rose petals toward the gazebo...'}
            {(phase === 'proposal' || phase === 'celebrate') && '💫 Starlit Beach · Midnight'}
          </div>
          <div className="pointer-events-auto flex gap-1.5 sm:gap-2">
            <button
              onClick={triggerFullscreen}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-panel flex items-center justify-center border border-sky-500/30 text-slate-300 active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            {phase !== 'explore' && (
              <button
                onClick={() => setPhase('explore')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-panel flex items-center justify-center border border-sky-500/30 text-slate-300 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleToggleMute}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-panel flex items-center justify-center border border-sky-500/30 text-slate-300 active:scale-95"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
            </button>
          </div>
        </div>
      )}

      {/* Walking hint */}
      {phase === 'explore' && (
        <div className="fixed bottom-20 sm:bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="glass-panel px-4 py-2 rounded-full border border-rose-400/20 text-[11px] sm:text-xs text-rose-200/80">
            🌹 Walk toward the candlelit gazebo ahead...
          </div>
        </div>
      )}

      {/* ── PHASE: CINEMATIC — rose giving sequence ── */}
      {phase === 'cinematic' && (
        <CinematicSequence
          yourName={yourName}
          herName={herName}
          onComplete={handleCinematicComplete}
        />
      )}

      {/* ── PHASE: PROPOSAL + CELEBRATE ── */}
      {(phase === 'proposal' || phase === 'celebrate') && (
        <ProposalOverlay
          herName={herName}
          yourName={yourName}
          isAccepted={phase === 'celebrate'}
          onAccepted={() => setPhase('celebrate')}
        />
      )}
    </div>
  );
};
