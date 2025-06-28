'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are necessary.');
      return;
    }

    try {
      const resUserExists = await fetch('/api/userExists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError('User already exists.');
        return;
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        setError('User registration failed.');
      }
    } catch (error) {
      setError('Something went wrong.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {/* Floating casino elements */}
      <span style={{position:'absolute',top:'10%',left:'8%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #ffd700)'}} role="img" aria-label="chip">🟣</span>
      <span style={{position:'absolute',top:'80%',left:'85%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #e60073)'}} role="img" aria-label="chip">🔴</span>
      <span style={{position:'absolute',top:'30%',left:'60%',fontSize:'2.2rem',filter:'drop-shadow(0 0 8px #fff)'}} role="img" aria-label="dice">🎲</span>
      {/* Glow behind card */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 420,
        height: 420,
        background: 'radial-gradient(circle, #ffd700 0%, #18131a 80%)',
        opacity: 0.18,
        filter: 'blur(32px)',
        transform: 'translate(-50%, -50%)',
        zIndex: 0
      }} />
      <div className="casino-card w-full max-w-sm relative z-10">
        <div className="p-8">
          <h1 className="casino-title text-center mb-2">Register</h1>
          <p className="text-gray-300 text-center mb-6">Create an account to start playing.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="casino-input w-full" id="name" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="casino-input w-full" id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="casino-input w-full" id="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="casino-btn w-full">Create an account</button>
          </form>
          <p className="text-sm text-center mt-6 text-gray-200">
            Already have an account?{' '}
            <Link href="/login" className="casino-link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 