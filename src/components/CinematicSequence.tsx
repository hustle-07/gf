import React, { useState, useEffect } from 'react';

interface CinematicSequenceProps {
  yourName: string;
  herName: string;
  onComplete: () => void;
}

// Each slide: text spoken + duration before auto-advance
const SLIDES = [
  {
    speaker: null,
    line: null,
    action: '🌹 He reaches out slowly...',
    duration: 2200,
    emoji: '🌹',
  },
  {
    speaker: 'Prashant',
    line: '"I picked this for you, Raj Nandani..."',
    action: null,
    duration: 3000,
    emoji: '🌸',
  },
  {
    speaker: null,
    line: null,
    action: '💫 He looks into your eyes...',
    duration: 2000,
    emoji: '💫',
  },
  {
    speaker: 'Prashant',
    line: '"Before this night ends... I need you to know something."',
    action: null,
    duration: 3400,
    emoji: '🌊',
  },
  {
    speaker: null,
    line: null,
    action: '💍 He slowly gets back on one knee...',
    duration: 2200,
    emoji: '💍',
  },
  {
    speaker: 'Prashant',
    line: '"I love you, Raj Nandani. With everything I am."',
    action: null,
    duration: 3400,
    emoji: '❤️',
  },
];

export const CinematicSequence: React.FC<CinematicSequenceProps> = ({ yourName, herName, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState(false);

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Auto advance slides
  useEffect(() => {
    if (currentSlide >= SLIDES.length) {
      // All done → trigger proposal
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const slide = SLIDES[currentSlide];
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentSlide(s => s + 1);
        setVisible(true);
      }, 400); // cross-fade gap
    }, slide.duration);
    return () => clearTimeout(t);
  }, [currentSlide, onComplete]);

  if (currentSlide >= SLIDES.length) return null;

  const slide = SLIDES[currentSlide];

  return (
    // Dark cinematic overlay — letterboxed top + bottom
    <div className="fixed inset-0 z-40 pointer-events-none select-none flex flex-col justify-between">
      {/* Top letterbox */}
      <div className="h-14 sm:h-16 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <span className="text-[11px] sm:text-xs text-white/40 tracking-[0.3em] uppercase font-display">
          🌊 Beachside · Midnight
        </span>
      </div>

      {/* Center — emoji pulse */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <span
          className="text-5xl sm:text-6xl"
          style={{
            animation: 'glow-pulse 1.8s ease-in-out infinite',
            display: 'inline-block',
            filter: 'drop-shadow(0 0 20px rgba(244,63,94,0.9))',
          }}
        >
          {slide.emoji}
        </span>
      </div>

      {/* Bottom letterbox — dialogue */}
      <div
        className="bg-black/85 backdrop-blur-sm px-6 sm:px-10 pt-4 pb-5 sm:pb-7"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease', minHeight: 90 }}
      >
        {slide.action && (
          <p className="text-center text-amber-200/80 italic text-xs sm:text-sm mb-1 tracking-wide">
            {slide.action}
          </p>
        )}
        {slide.speaker && (
          <p className="text-center text-rose-300 font-bold text-[11px] sm:text-xs mb-0.5 tracking-widest uppercase">
            {slide.speaker}
          </p>
        )}
        {slide.line && (
          <p className="text-center text-white font-serif text-base sm:text-xl leading-snug">
            {slide.line}
          </p>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === currentSlide ? '#f43f5e' : i < currentSlide ? '#fb7185' : 'rgba(255,255,255,0.2)',
                transform: i === currentSlide ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
