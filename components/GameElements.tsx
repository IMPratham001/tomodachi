'use client';

import { useState, useEffect, useRef } from 'react';
// @ts-ignore - No types available for chess.js
import { Chess } from 'chess.js';
// @ts-ignore - No types available for react-chessboard
import { Chessboard } from 'react-chessboard';

interface GameElementsProps {
  className?: string;
}

export function GameElements({ className = '' }: GameElementsProps) {
  const [game] = useState(() => new Chess());
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(300);
  
  // Type assertion for the chessboard position
  const boardPosition = game.fen() as string;

  // Initialize chess game with a random position
  useEffect(() => {
    const newGame = new Chess();
    // Start from a random position
    const moves = [
      'e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4',
      'O-O', 'd3', 'Qb3', 'Qf6', 'e5', 'Qg6', 'Re1', 'Nge7', 'Ba3', 'b5', 'Qxb5', 'Rb8',
      'Qa4', 'Bb6', 'Nbd2', 'Bb7', 'Ne4', 'Qf5', 'Bxd3', 'Qh5', 'Nf6+', 'gxf6', 'exf6',
      'Rg8', 'h4', 'd5', 'h5', 'Bxh5', 'Re4', 'Nf5', 'Rh4', 'Qxh4', 'Bf7+', 'Kd8', 'Bb5+',
      'Kc8', 'Bd7+', 'Kb7', 'Qd6+', 'Ka6', 'Qxb8', 'Qxh1+', 'Kc2', 'Qxc1+', 'Kxc1', 'a5',
      'Qxa5#', '1-0'
    ];
    
    const moveCount = Math.floor(Math.random() * (moves.length / 2)) * 2;
    const gameMoves = moves.slice(0, moveCount);
    
    gameMoves.forEach(move => {
      try {
        newGame.move(move);
      } catch (e) {
        console.error('Invalid move:', move);
      }
    });
    
    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        setBoardWidth(Math.min(containerRef.current.offsetWidth - 40, 500));
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className={`w-full max-w-4xl mx-auto ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Game Elements</h2>
      
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 text-center text-white">Chess Position</h3>
          <div className="flex justify-center">
            <div style={{ width: boardWidth, height: boardWidth }}>
              <div className="chessboard-container" style={{ width: '100%', height: '100%' }}>
                <Chessboard 
                  position={boardPosition}
                  boardWidth={boardWidth}
                  boardOrientation="white"
                  areArrowsAllowed={false}
                  customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
