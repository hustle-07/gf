import React, { useRef, useEffect } from 'react';

interface MobileJoystickProps {
  moveInputRef: React.MutableRefObject<{ forward: number; strafe: number }>;
  lookDeltaRef: React.MutableRefObject<{ dx: number; dy: number }>;
  visible: boolean;
}

export const MobileJoystick: React.FC<MobileJoystickProps> = ({
  moveInputRef,
  lookDeltaRef,
  visible
}) => {
  const stickRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  
  // Track which touch is joystick vs look
  const joystickTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lookPrev = useRef<{ x: number; y: number } | null>(null);
  
  // Dynamic joystick anchor position (placed where user first presses on left side)
  const joystickAnchor = useRef<{ x: number; y: number }>({ x: 80, y: window.innerHeight - 120 });

  useEffect(() => {
    if (!visible) return;

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const leftHalf = t.clientX < window.innerWidth * 0.45;

        if (leftHalf && joystickTouchId.current === null) {
          joystickTouchId.current = t.identifier;
          // Anchor joystick where user pressed
          joystickAnchor.current = { x: t.clientX, y: t.clientY };
          // Visually move joystick base to touch position
          if (baseRef.current) {
            baseRef.current.style.left = `${t.clientX - 48}px`;
            baseRef.current.style.top = `${t.clientY - 48}px`;
            baseRef.current.style.opacity = '1';
          }
          if (stickRef.current) {
            stickRef.current.style.transform = 'translate(0px, 0px)';
          }
        } else if (!leftHalf && lookTouchId.current === null) {
          lookTouchId.current = t.identifier;
          lookPrev.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === joystickTouchId.current) {
          const dx = t.clientX - joystickAnchor.current.x;
          const dy = t.clientY - joystickAnchor.current.y;
          const dist = Math.hypot(dx, dy);
          const maxR = 42;
          const clampedDx = dist > maxR ? (dx / dist) * maxR : dx;
          const clampedDy = dist > maxR ? (dy / dist) * maxR : dy;

          if (stickRef.current) {
            stickRef.current.style.transform = `translate(${clampedDx}px, ${clampedDy}px)`;
          }
          moveInputRef.current.forward = -clampedDy / maxR;
          moveInputRef.current.strafe = clampedDx / maxR;
        }

        if (t.identifier === lookTouchId.current && lookPrev.current) {
          lookDeltaRef.current.dx += (t.clientX - lookPrev.current.x) * 0.007;
          lookDeltaRef.current.dy += (t.clientY - lookPrev.current.y) * 0.007;
          lookPrev.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          moveInputRef.current.forward = 0;
          moveInputRef.current.strafe = 0;
          if (stickRef.current) stickRef.current.style.transform = 'translate(0px, 0px)';
          if (baseRef.current) baseRef.current.style.opacity = '0.5';
        }
        if (t.identifier === lookTouchId.current) {
          lookTouchId.current = null;
          lookPrev.current = null;
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [visible, moveInputRef, lookDeltaRef]);

  if (!visible) return null;

  return (
    <>
      {/* Dynamic Joystick Base (positioned by first touch) */}
      <div
        ref={baseRef}
        className="fixed z-40 pointer-events-none"
        style={{
          width: 96,
          height: 96,
          left: joystickAnchor.current.x - 48,
          top: joystickAnchor.current.y - 48,
          borderRadius: '50%',
          border: '2px solid rgba(244,63,94,0.5)',
          background: 'rgba(15,12,40,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5,
          transition: 'opacity 0.2s',
        }}
      >
        <div
          ref={stickRef}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
            border: '2px solid rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          ✦
        </div>
      </div>

      {/* Left zone label */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <span className="text-[10px] text-rose-300/60 font-medium tracking-widest uppercase">
          Touch to walk
        </span>
      </div>

      {/* Right zone label */}
      <div className="fixed bottom-4 right-4 z-30 pointer-events-none">
        <span className="text-[10px] text-rose-300/60 font-medium tracking-widest uppercase text-right">
          Swipe to look
        </span>
      </div>
    </>
  );
};
