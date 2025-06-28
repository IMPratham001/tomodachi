'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [friendEmail, setFriendEmail] = useState('');
  const [message, setMessage] = useState('');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: friendEmail }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setFriendEmail('');
      }
    } catch (error) {
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      {/* Floating casino elements */}
      <span style={{position:'absolute',top:'10%',left:'8%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #ffd700)'}} role="img" aria-label="chip">🟣</span>
      <span style={{position:'absolute',top:'80%',left:'85%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #e60073)'}} role="img" aria-label="chip">🔴</span>
      <span style={{position:'absolute',top:'30%',left:'60%',fontSize:'2.2rem',filter:'drop-shadow(0 0 8px #fff)'}} role="img" aria-label="dice">🎲</span>
      {/* Glow behind card */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 900,
        height: 420,
        background: 'radial-gradient(circle, #e60073 0%, #18131a 80%)',
        opacity: 0.18,
        filter: 'blur(32px)',
        transform: 'translate(-50%, -50%)',
        zIndex: 0
      }} />
      <div className="flex flex-col md:flex-row gap-8 z-10">
        <div className="casino-card w-full max-w-md">
          <div className="p-8">
            <h1 className="casino-title text-center mb-4">Profile</h1>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-24 h-24 rounded-full bg-black/40 border-4 border-[#ffd700] flex items-center justify-center text-4xl text-[#ffd700] font-bold">
                {session.user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold neon-gold">{session.user?.name}</h2>
                <p className="text-gray-300">{session.user?.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold neon-text">Game Stats</h3>
              <p className="text-gray-200">Games Played: 0</p>
              <p className="text-gray-200">Wins: 0</p>
            </div>
          </div>
        </div>
        <div className="casino-card w-full max-w-md">
          <div className="p-8">
            <h1 className="casino-title text-center mb-4">Friends</h1>
            <form onSubmit={handleAddFriend} className="flex space-x-2 mb-4">
              <input
                className="casino-input flex-1"
                type="email"
                placeholder="Friend's email"
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
              />
              <button type="submit" className="casino-btn">Add</button>
            </form>
            {message && <p className="text-sm mt-2 text-gray-200">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
} 