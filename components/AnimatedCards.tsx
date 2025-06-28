import React, { useEffect, useState } from 'react';

const cardSymbols = [
  { symbol: '🂡', label: 'Ace of Spades' },
  { symbol: '🂱', label: 'Ace of Hearts' },
  { symbol: '🃁', label: 'Ace of Diamonds' },
  { symbol: '🃑', label: 'Ace of Clubs' },
  { symbol: '🂭', label: 'Queen of Spades' },
  { symbol: '🂽', label: 'Queen of Hearts' },
  { symbol: '🃍', label: 'Queen of Diamonds' },
  { symbol: '🃝', label: 'Queen of Clubs' },
  { symbol: '🂮', label: 'King of Spades' },
  { symbol: '🂾', label: 'King of Hearts' },
  { symbol: '🃎', label: 'King of Diamonds' },
  { symbol: '🃞', label: 'King of Clubs' },
];

function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const AnimatedCards: React.FC = () => {
  const [cards, setCards] = useState(() =>
    Array.from({ length: 7 }).map((_, i) => ({
      ...cardSymbols[i % cardSymbols.length],
      top: getRandom(10, 80),
      left: getRandom(10, 80),
      rotate: getRandom(-30, 30),
      delay: getRandom(0, 2),
      scale: getRandom(1.1, 1.5),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(cards =>
        cards.map(card => ({
          ...card,
          top: getRandom(10, 80),
          left: getRandom(10, 80),
          rotate: getRandom(-30, 30),
          scale: getRandom(1.1, 1.5),
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {cards.map((card, i) => (
        <span
          key={i}
          className="absolute animate-cardFloat"
          style={{
            top: `${card.top}%`,
            left: `${card.left}%`,
            fontSize: `${3.2 * card.scale}rem`,
            transform: `rotate(${card.rotate}deg) scale(${card.scale})`,
            filter: 'drop-shadow(0 0 12px #ffd700) drop-shadow(0 0 24px #7c2d12)',
            opacity: 0.7,
            animationDelay: `${card.delay}s`,
            zIndex: 2,
            transition: 'top 2.5s, left 2.5s, transform 2.5s',
            textShadow: '0 0 16px #ffd700, 0 0 32px #7c2d12',
          }}
          aria-label={card.label}
        >
          {card.symbol}
        </span>
      ))}
      <style jsx>{`
        @keyframes cardFloat {
          0% { opacity: 0.6; transform: translateY(0) scale(1); }
          50% { opacity: 0.9; transform: translateY(-18px) scale(1.08); }
          100% { opacity: 0.6; transform: translateY(0) scale(1); }
        }
        .animate-cardFloat {
          animation: cardFloat 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}; 