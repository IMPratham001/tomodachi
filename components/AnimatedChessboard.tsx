import React, { useEffect, useRef } from 'react';

const boardSize = 8;
const pieceSymbols = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖'],
];

export const AnimatedChessboard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (boardRef.current) {
        const t = Date.now() * 0.001;
        boardRef.current.style.transform = `translateY(${Math.sin(t) * 10}px) scale(1.04) rotate(${Math.sin(t/2) * 2}deg)`;
        boardRef.current.style.boxShadow = `0 0 40px 10px rgba(139,0,0,0.25), 0 0 80px 10px rgba(75,0,130,0.15)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div
      ref={boardRef}
      className="pointer-events-none absolute left-1/2 top-1/2 z-0"
      style={{
        width: 420,
        height: 420,
        transform: 'translate(-50%, -50%)',
        opacity: 0.22,
        filter: 'blur(0.5px) drop-shadow(0 0 12px #7c2d12)',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          width: '100%',
          height: '100%',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 0 24px 2px #000',
        }}
      >
        {Array.from({ length: boardSize * boardSize }).map((_, idx) => {
          const x = idx % boardSize;
          const y = Math.floor(idx / boardSize);
          const isDark = (x + y) % 2 === 1;
          const piece = pieceSymbols[y][x];
          return (
            <div
              key={idx}
              style={{
                background: isDark ? 'rgba(30,0,15,0.85)' : 'rgba(255,255,255,0.08)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                color: piece ? (isDark ? '#dc2626' : '#7c2d12') : 'transparent',
                textShadow: piece ? '0 0 8px #dc2626, 0 0 16px #7c2d12' : 'none',
                transition: 'background 0.5s',
                animation: piece ? `piecePulse 2.5s ${0.1 * (x + y)}s infinite alternate` : 'none',
              }}
            >
              {piece}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes piecePulse {
          0% { filter: brightness(1) drop-shadow(0 0 0px #fff); }
          100% { filter: brightness(1.3) drop-shadow(0 0 8px #fff); }
        }
      `}</style>
    </div>
  );
}; 