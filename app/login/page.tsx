'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const manipulativeQuotes = [
  "The most terrifying monster is the one that looks just like you.",
  "Friendship is just another tool to be exploited.",
  "In this game, trust is the deadliest weapon.",
  "Your deepest secrets will become your greatest weakness.",
  "Everyone has a price. What's yours?",
  "The real game begins when you think it's over.",
  "Betrayal tastes sweetest when served by a friend.",
  "Your mind is your greatest enemy and your only ally.",
  "Manipulation is an art form. Will you be the artist or the canvas?"
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % manipulativeQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials');
        return;
      }

      router.replace('/');
    } catch (error) {
      setError('Something went wrong.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* Animated sinister symbols */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {['🃏','💀','🎲','🦹‍♂️','🩸','♠','♣','♦','♥','👁️','🧠','⚡','🎭','🗡️','🔪','⛓️'].map((symbol, i) => (
          <span
            key={`symbol-${i}`}
            className="absolute text-red-900/15 animate-float"
            style={{
              fontSize: `${Math.random() * 3 + 1.8}rem`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              filter: `blur(${0.5 + Math.random() * 0.3}px)`,
              animationDelay: `${i * -1.5}s`,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>
      {/* Blood Drips */}
      <div className="blood-drip" style={{ top: 0, left: '10%' }} />
      <div className="blood-drip" style={{ top: 0, left: '50%' }} />
      <div className="blood-drip" style={{ top: 0, right: '15%' }} />
      <div className="blood-drip" style={{ top: 0, left: '80%' }} />
      {/* Blood Splatters */}
      <div className="blood-splatter" style={{ top: '20%', left: '8%', width: 60, height: 40, transform: 'rotate(-12deg)' }} />
      <div className="blood-splatter" style={{ top: '60%', left: '80%', width: 80, height: 50, transform: 'rotate(18deg)' }} />
      <div className="blood-splatter" style={{ top: '75%', left: '30%', width: 40, height: 30, transform: 'rotate(-8deg)' }} />
      <div className="blood-splatter" style={{ top: '40%', left: '60%', width: 50, height: 35, transform: 'rotate(22deg)' }} />
      {/* Glow behind card */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 420,
        height: 420,
        background: 'radial-gradient(circle, #e60073 0%, #18131a 80%)',
        opacity: 0.18,
        filter: 'blur(32px)',
        transform: 'translate(-50%, -50%)',
        zIndex: 0
      }} />
      <div className="casino-card w-full max-w-sm relative z-10">
        <div className="p-8">
          <h1 className="casino-title text-center mb-2">Login</h1>
          <div className="psychological-message mb-4 text-base">{manipulativeQuotes[currentQuote]}</div>
          <p className="text-gray-300 text-center mb-6 manipulation-text">Enter your credentials to access your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="casino-input w-full"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
            />
            <input
              className="casino-input w-full"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="casino-btn w-full">Login</button>
          </form>
          <p className="text-sm text-center mt-6 text-gray-200">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="casino-link">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}