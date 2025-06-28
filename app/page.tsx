"use client";

import { useState, useEffect, useRef } from "react";
import { Users, BookOpen, Swords, KeyRound, Crown, Eye, Brain } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThreeDCasinoScene } from "@/components/ThreeDCasinoScene";

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

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showIcons, setShowIcons] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
        setSpotlight({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(Math.floor(Math.random() * manipulativeQuotes.length));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setShowIcons(prev => !prev);
    }, 4000);

    return () => clearInterval(iconInterval);
  }, []);

  const handleCreateRoom = async () => {
    if (!nickname.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Creating room with nickname:", nickname);
    }, 2000);
  };

  const handleJoinRoom = async () => {
    if (!nickname.trim() || !roomCode.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Joining room:", roomCode, "with nickname:", nickname);
    }, 2000);
  };

  const handleTutorial = () => {
    console.log("Opening tutorial");
  };

  // Enhanced game symbols with more chess pieces and cards
  const gameSymbols = [
    // Chess Pieces
    '♔', '♕', '♖', '♗', '♘', '♙', // White pieces
    '♚', '♛', '♜', '♝', '♞', '♟', // Black pieces
    // Playing Cards
    '🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂭', '🂮', // Spades
    '🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂽', '🂾', // Hearts
    '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃍', '🃎', // Diamonds
    '🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃝', '🃞', // Clubs
    // Special Cards
    '🃟', '🃏', '🂠', '🃵', '🃶', '🃄', '🃌', '🃛', '🃝', '🃞', '🃑', '🃚', '🃊'
  ];

  const floatingGameSymbols = Array.from({ length: 40 }, (_, i) => {
    const symbol = gameSymbols[i % gameSymbols.length];
    const baseX = (i % 5) * 20 + 10;
    const baseY = Math.floor(i / 5) * 20 + 10;
    const followIntensity = 0.05;
    const x = baseX + (mousePosition.x - 0.5) * followIntensity * 50;
    const y = baseY + (mousePosition.y - 0.5) * followIntensity * 50;
    
    return (
      <div
        key={`symbol-${i}`}
        className={`absolute transition-all duration-2000 ease-out ${showIcons ? 'opacity-60 scale-110' : 'opacity-20 scale-90'}`}
        style={{
          left: `${Math.max(5, Math.min(90, x))}%`,
          top: `${Math.max(5, Math.min(85, y))}%`,
          transform: `rotate(${Math.sin(Date.now() * 0.001 + i) * 15}deg)`,
          fontSize: `${1.5 + Math.sin(Date.now() * 0.002 + i) * 0.5}rem`,
          filter: `drop-shadow(0 0 10px rgba(139, 0, 0, 0.6)) hue-rotate(${i * 20}deg)`,
          animationDelay: `${i * 0.2}s`,
          zIndex: 1,
          textShadow: `0 0 8px rgba(139, 0, 0, ${0.4 + Math.sin(Date.now() * 0.003 + i) * 0.2})`,
          color: symbol.includes('♔') || symbol.includes('♕') || symbol.includes('♖') || symbol.includes('♗') || symbol.includes('♘') || symbol.includes('♙') ? '#dc2626' : 
                symbol.includes('♚') || symbol.includes('♛') || symbol.includes('♜') || symbol.includes('♝') || symbol.includes('♞') || symbol.includes('♟') ? '#7c2d12' :
                symbol.includes('♠') || symbol.includes('♣') || symbol.includes('🂡') || symbol.includes('🃡') ? '#1f2937' :
                '#dc2626'
        }}
      >
        <span className={`animate-pulse transition-all duration-500 ${isHovering ? 'scale-125' : ''}`}>
          {symbol}
        </span>
      </div>
    );
  });

  return (
    <div 
      ref={containerRef}
      className="casino-carpet-bg min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 3D Casino Scene as background */}
      <ThreeDCasinoScene />
      {/* Gold Sparkle Overlay */}
      <div className="gold-sparkle-overlay" />
      {/* Moving Spotlight Overlay */}
      <div className="spotlight-overlay" style={{'--spot-x': `${spotlight.x}%`, '--spot-y': `${spotlight.y}%`} as React.CSSProperties} />
      {/* Intense Vignette for psychological mood */}
      <div className="vignette" />
      {/* Casino Auth Buttons */}
      <div style={{position:'absolute',top:24,right:32,zIndex:100}} className="flex gap-4">
        {!session && (
          <>
            <Link href="/login" className="px-6 py-2 rounded-lg neon-border casino-font font-bold text-lg bg-black/60 hover:bg-black/80 transition-all duration-300 shadow-lg">Login</Link>
            <Link href="/register" className="px-6 py-2 rounded-lg neon-border casino-font font-bold text-lg bg-black/60 hover:bg-black/80 transition-all duration-300 shadow-lg">Register</Link>
          </>
        )}
        {session && (
          <Link href="/profile" className="px-6 py-2 rounded-lg neon-border casino-font font-bold text-lg bg-black/60 hover:bg-black/80 transition-all duration-300 shadow-lg" style={{color:'#fff',textShadow:'0 0 8px #0ff,0 0 16px #0ff'}}>Profile</Link>
        )}
      </div>
      {/* Floating casino elements (reduced) */}
      <span style={{position:'absolute',top:'12%',left:'8%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #ffd700)',zIndex:4}} role="img" aria-label="chip">🟣</span>
      <span style={{position:'absolute',top:'70%',left:'85%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #e60073)',zIndex:4}} role="img" aria-label="chip">🔴</span>
      <span style={{position:'absolute',top:'30%',left:'60%',fontSize:'2.2rem',filter:'drop-shadow(0 0 8px #fff)',zIndex:4}} role="img" aria-label="dice">🎲</span>
      <span style={{position:'absolute',top:'80%',left:'20%',fontSize:'2.2rem',filter:'drop-shadow(0 0 8px #ffd700)'}} role="img" aria-label="card">🂡</span>
      <span style={{position:'absolute',top:'50%',left:'40%',fontSize:'2.2rem',filter:'drop-shadow(0 0 8px #e60073)'}} role="img" aria-label="card">🂫</span>
      <span style={{position:'absolute',top:'15%',left:'75%',fontSize:'2.2rem',filter:'drop-shadow(0 0 8px #ffd700)'}} role="img" aria-label="chip">🟢</span>
      
      {/* Additional Chess Pieces */}
      <span style={{position:'absolute',top:'25%',left:'15%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #ff5555)'}} role="img" aria-label="chess-piece">♗</span>
      <span style={{position:'absolute',top:'65%',left:'75%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #55aaff)'}} role="img" aria-label="chess-piece">♞</span>
      <span style={{position:'absolute',top:'35%',left:'25%',fontSize:'3rem',filter:'drop-shadow(0 0 10px #ffaa00)'}} role="img" aria-label="chess-piece">♛</span>
      <span style={{position:'absolute',top:'75%',left:'65%',fontSize:'3rem',filter:'drop-shadow(0 0 10px #aa55ff)'}} role="img" aria-label="chess-piece">♚</span>
      
      {/* Additional Playing Cards */}
      <span style={{position:'absolute',top:'20%',left:'85%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #ff5555)', transform: 'rotate(15deg)'}} role="img" aria-label="card">🂾</span>
      <span style={{position:'absolute',top:'85%',left:'15%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #55aaff)', transform: 'rotate(-10deg)'}} role="img" aria-label="card">🃎</span>
      <span style={{position:'absolute',top:'80%',left:'80%',fontSize:'2.5rem',filter:'drop-shadow(0 0 8px #ffaa00)', transform: 'rotate(20deg)'}} role="img" aria-label="card">🃁</span>
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
      
      {/* Brick Grid Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(20, 1fr)',
          gridTemplateRows: 'repeat(12, 1fr)',
          opacity: 0.18,
        }}
      >
        {Array.from({ length: 20 * 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              border: '1.5px solid #222',
              background:
                i % 2 === 0
                  ? 'linear-gradient(135deg, #232323 80%, #181818 100%)'
                  : 'linear-gradient(135deg, #232323 60%, #111 100%)',
              borderRadius: '2px',
              boxShadow:
                Math.random() > 0.85
                  ? '0 0 8px 1px #000, 0 0 0 2px #2a2a2a' // some bricks look cracked
                  : 'none',
            }}
          />
        ))}
      </div>

      {/* Enhanced Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(circle at ${20 + mousePosition.x * 60}% ${30 + mousePosition.y * 40}%, rgba(139, 0, 0, ${0.3 + mousePosition.x * 0.2}) 0%, transparent 50%),
            radial-gradient(circle at ${80 - mousePosition.x * 60}% ${70 + mousePosition.y * 20}%, rgba(75, 0, 130, ${0.2 + mousePosition.y * 0.2}) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.92) 0%, rgba(20, 20, 20, 1) 100%),
            linear-gradient(${45 + mousePosition.x * 90}deg, #0f0f0f 0%, #1a1a1a 25%, #0f0f0f 50%, #2a0a0a 75%, #0f0f0f 100%)
          `,
          backgroundSize: '600px 600px, 800px 800px, 100% 100%, 80px 80px'
        }}
      />

      {/* Enhanced Animated Pattern Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-30 transition-all duration-1000"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              ${45 + mousePosition.x * 20}deg,
              transparent,
              transparent 3px,
              rgba(139, 0, 0, ${0.1 + mousePosition.y * 0.05}) 3px,
              rgba(139, 0, 0, ${0.1 + mousePosition.y * 0.05}) 6px
            ),
            repeating-linear-gradient(
              ${-45 - mousePosition.y * 20}deg,
              transparent,
              transparent 3px,
              rgba(75, 0, 130, ${0.05 + mousePosition.x * 0.03}) 3px,
              rgba(75, 0, 130, ${0.05 + mousePosition.x * 0.03}) 6px
            )
          `,
          animation: 'patternShift 20s ease-in-out infinite'
        }}
      />

      {/* Corner Chess Pieces */}
      {/* Top Left Corner - King and Queen */}
      <div className="absolute top-6 left-6 text-6xl text-red-700/70 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-500" style={{zIndex: 10}}>
        ♔
      </div>
      <div className="absolute top-20 left-6 text-5xl text-red-600/60 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-400" style={{animationDelay: '0.5s', zIndex: 10}}>
        ♕
      </div>
      
      {/* Top Right Corner - Rook and Bishop */}
      <div className="absolute top-6 right-6 text-6xl text-red-700/70 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-500" style={{animationDelay: '0.5s', zIndex: 10}}>
        ♖
      </div>
      <div className="absolute top-20 right-6 text-5xl text-red-600/60 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-400" style={{animationDelay: '0.8s', zIndex: 10}}>
        ♗
      </div>
      
      {/* Bottom Left Corner - Knight and Pawn */}
      <div className="absolute bottom-6 left-6 text-6xl text-red-700/70 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-500" style={{animationDelay: '0.3s', zIndex: 10}}>
        ♘
      </div>
      <div className="absolute bottom-20 left-6 text-5xl text-red-600/60 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-400" style={{animationDelay: '0.7s', zIndex: 10}}>
        ♙
      </div>
      
      {/* Bottom Right Corner - Black Chess Pieces */}
      <div className="absolute bottom-6 right-6 text-6xl text-red-700/70 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-500" style={{animationDelay: '0.4s', zIndex: 10}}>
        ♚
      </div>
      <div className="absolute bottom-20 right-6 text-5xl text-red-600/60 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-400" style={{animationDelay: '0.6s', zIndex: 10}}>
        ♛
      </div>
      <div className="absolute bottom-6 right-6 text-6xl text-red-700/70 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-500" style={{animationDelay: '0.8s', zIndex: 10}}>
        ♜
      </div>
      <div className="absolute bottom-6 right-20 text-5xl text-red-600/60 animate-pulse transition-all duration-500 hover:scale-125 hover:text-red-400" style={{animationDelay: '0.9s', zIndex: 10}}>
        ♗
      </div>

      {/* Main Content */}
      <main className="w-full max-w-lg relative z-10 flex flex-col items-center">
        
        {/* Enhanced Title Section */}
        <div className="text-center mb-12 relative">
          <div className="relative group">
            <h1 className="text-8xl font-bold neon-text casino-font bg-gradient-to-b from-red-300 via-red-500 to-red-900 bg-clip-text text-transparent mb-4 tracking-tight filter drop-shadow-[0_8px_30px_rgba(139,0,0,0.9)] transition-all duration-700 group-hover:scale-105 animate-pulse">
              TOMODACHI
            </h1>
            
            {/* Enhanced glitch effect overlay */}
            <div className="absolute inset-0 text-8xl font-bold text-red-500/30 animate-pulse -translate-x-1 translate-y-1 group-hover:animate-none casino-font">
              <span className="animate-glitch opacity-80">TOMODACHI</span>
            </div>
            
            {/* Chess piece decorations around title */}
            <div className="absolute -top-4 left-1/4 text-3xl text-red-600/60 animate-bounce">♘</div>
            <div className="absolute -top-4 right-1/4 text-3xl text-red-600/60 animate-bounce" style={{animationDelay: '0.5s'}}>♞</div>
            <div className="absolute -bottom-4 left-1/3 text-3xl text-red-600/60 animate-bounce" style={{animationDelay: '1s'}}>♖</div>
            <div className="absolute -bottom-4 right-1/3 text-3xl text-red-600/60 animate-bounce" style={{animationDelay: '1.5s'}}>♜</div>
          </div>
          
          {/* Enhanced Psychological Quote Carousel */}
          <div className="flex items-center justify-center gap-4 mt-8 mb-6 min-h-[4rem]">
            <Brain className="h-7 w-7 text-purple-400/90 animate-pulse transition-all duration-500 hover:scale-125" />
            <p 
              key={currentQuote}
              className="text-lg text-red-200/95 font-medium italic max-w-md transition-all duration-1500 leading-relaxed casino-font"
              style={{
                textShadow: '0 0 15px rgba(239, 68, 68, 0.4), 0 0 30px rgba(239, 68, 68, 0.2)',
                animation: 'fadeInOut 5s ease-in-out infinite'
              }}
            >
              &quot;{manipulativeQuotes[currentQuote].replace(/"/g, '&quot;')}&quot;
            </p>
            <Eye className="h-7 w-7 text-red-400/90 animate-pulse transition-all duration-500 hover:scale-125" style={{animationDelay: '1s'}} />
          </div>
          
          <div className="text-sm text-gray-400/90 font-mono tracking-wider animate-pulse casino-font">
            [ PSYCHOLOGICAL WARFARE INITIATED ]
          </div>
        </div>
        
        {/* Enhanced Main Game Panel */}
        <div 
          className={`w-full p-8 space-y-8 relative rounded-2xl shadow-2xl group transition-all duration-700 neon-border ${isHovering ? 'shadow-red-900/50' : 'shadow-red-900/30'}`}
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(0,0,0,0.97) 0%, 
                rgba(20,5,5,0.92) 20%, 
                rgba(15,15,15,0.97) 40%, 
                rgba(30,0,15,0.92) 60%, 
                rgba(10,10,10,0.97) 80%,
                rgba(0,0,0,0.97) 100%
              )
            `,
            backdropFilter: 'blur(15px)',
            borderImage: `linear-gradient(45deg, rgba(139,0,0,${0.6 + mousePosition.x * 0.2}), rgba(75,0,130,${0.4 + mousePosition.y * 0.2}), rgba(139,0,0,${0.6 + mousePosition.x * 0.2})) 1`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset 0 -1px 0 rgba(139,0,0,0.3),
              0 0 50px rgba(139,0,0,${0.3 + mousePosition.x * 0.2}),
              0 0 100px rgba(75,0,130,${0.1 + mousePosition.y * 0.1})
            `
          }}
        >
          {/* Corner game pieces */}
          <div className="absolute top-3 left-3 text-red-600/50 text-3xl transition-all duration-500 hover:scale-150 hover:text-red-500" style={{animation: 'spin 12s linear infinite'}}>♕</div>
          <div className="absolute top-3 right-3 text-purple-600/50 text-3xl transition-all duration-500 hover:scale-150 hover:text-purple-500" style={{animation: 'spin 18s linear infinite reverse'}}>♠</div>
          
          {/* Enhanced Nickname Input */}
          <div className="relative group">
            <div className="absolute -top-4 left-6 text-xs text-red-400/80 font-mono tracking-wide animate-pulse">
              [ ENTER ALIAS FOR PSYCHOLOGICAL PROFILE ]
            </div>
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-red-400/80 group-focus-within:text-red-300 group-focus-within:scale-110 transition-all duration-300 group-focus-within:animate-pulse" />
            <input
              placeholder="Your mask awaits..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-gradient-to-r from-black/90 to-gray-900/90 border-2 border-red-800/60 rounded-xl h-16 pl-14 pr-6 text-xl text-white placeholder:text-red-300/50 focus:outline-none focus:ring-4 focus:ring-red-500/60 focus:border-purple-500/70 transition-all duration-500 shadow-inner hover:border-red-700/70 hover:shadow-red-900/30"
              disabled={isLoading}
              style={{
                boxShadow: 'inset 0 3px 15px rgba(0,0,0,0.9), 0 0 25px rgba(139,0,0,0.25)',
                textShadow: '0 0 8px rgba(255,255,255,0.4)'
              }}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-900/8 via-purple-900/8 to-red-900/8 pointer-events-none animate-pulse"></div>
          </div>

          {/* Enhanced Game Actions */}
          <div className="space-y-6">
            <button 
              onClick={handleCreateRoom}
              disabled={!nickname.trim() || isLoading}
              className="group w-full h-20 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 disabled:from-gray-800 disabled:to-gray-900 text-white text-xl rounded-xl transition-all duration-700 transform hover:scale-[1.05] disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden border border-red-700/60 hover:border-red-600/80 hover:shadow-red-900/50 neon-gold"
              style={{
                boxShadow: '0 10px 30px rgba(139,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                textShadow: '0 2px 6px #ffd700, 0 0 8px #ffd700'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-red-700/30 to-transparent animate-pulse"></div>
              
              <div className="relative flex items-center justify-center py-5">
                {isLoading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="animate-pulse">INITIATING MIND GAMES...</span>
                    <Brain className="h-6 w-6 text-purple-300 animate-bounce" />
                  </div>
                ) : (
                  <>
                    <Swords className="h-8 w-8 mr-4 group-hover:rotate-45 transition-transform duration-700" />
                    <span className="font-bold tracking-wide">CREATE NEW PSYCHOLOGICAL ARENA</span>
                    <Crown className="h-7 w-7 ml-4 text-yellow-400 group-hover:text-yellow-300 animate-pulse group-hover:scale-125 transition-all duration-500" />
                  </>
                )}
              </div>
            </button>

            {/* Enhanced Divider */}
            <div className="relative flex items-center py-8">
              <div className="flex-grow">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-red-800/80 to-transparent animate-pulse"></div>
              </div>
              <div className="flex-shrink mx-10 px-8 py-4 bg-black/90 border-2 border-red-800/50 rounded-full relative transition-all duration-500 hover:border-red-600/70 hover:scale-105">
                <p className="text-red-300/80 text-sm max-w-md mx-auto mb-8 px-4 text-center italic">
                  {manipulativeQuotes[currentQuote].replace(/"/g, '&quot;')}
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-purple-900/30 rounded-full animate-pulse"></div>
                {/* Card symbols on divider */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-2xl text-red-500/60 animate-pulse">♥</div>
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-2xl text-red-500/60 animate-pulse">♦</div>
              </div>
              <div className="flex-grow">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-red-800/80 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Enhanced Join Section */}
            <div className="flex gap-4">
              <div className="relative flex-grow group">
                <div className="absolute -top-4 left-6 text-xs text-purple-400/80 font-mono tracking-wide animate-pulse">
                  [ INFILTRATION CODE ]
                </div>
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-purple-400/80 group-focus-within:text-purple-300 group-focus-within:scale-110 transition-all duration-300 group-focus-within:animate-pulse" />
                <input
                  placeholder="ENTER CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full bg-gradient-to-r from-black/90 to-purple-900/30 border-2 border-purple-800/60 rounded-xl h-16 pl-14 pr-6 text-xl text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-4 focus:ring-purple-500/60 focus:border-red-500/70 transition-all duration-500 shadow-inner hover:border-purple-700/70 font-mono tracking-widest hover:shadow-purple-900/30"
                  disabled={isLoading}
                  style={{
                    boxShadow: 'inset 0 3px 15px rgba(0,0,0,0.9), 0 0 25px rgba(75,0,130,0.25)',
                    textShadow: '0 0 8px rgba(255,255,255,0.4)'
                  }}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-900/8 to-red-900/8 pointer-events-none animate-pulse"></div>
              </div>
              
              <button 
                onClick={handleJoinRoom}
                disabled={!nickname.trim() || !roomCode.trim() || isLoading}
                className="px-12 h-16 bg-gradient-to-r from-purple-900/70 to-black/90 border-2 border-purple-800/60 rounded-xl text-purple-200 hover:bg-gradient-to-r hover:from-purple-800/90 hover:to-red-900/70 hover:text-white text-xl transition-all duration-700 disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-110 font-bold tracking-wide hover:shadow-purple-900/50"
                style={{
                  boxShadow: '0 8px 25px rgba(75,0,130,0.4)',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9)'
                }}
              >
                INFILTRATE
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tutorial Button */}
        <div className="mt-12 w-full">
          <button 
            onClick={handleTutorial}
            className="group w-full h-18 bg-gradient-to-r from-gray-900/70 via-black/90 to-gray-900/70 border-2 neon-border casino-font text-gray-300 hover:text-red-200 hover:bg-gradient-to-r hover:from-gray-800/90 hover:via-red-900/30 hover:to-gray-800/90 hover:border-red-700/60 text-lg rounded-xl transition-all duration-700 transform hover:scale-[1.03] relative overflow-hidden hover:shadow-red-900/30"
            disabled={isLoading}
            style={{
              boxShadow: '0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2500"></div>
            
            <div className="relative flex items-center justify-center font-medium tracking-wide py-4">
              <BookOpen className="h-7 w-7 mr-4 group-hover:rotate-12 transition-transform duration-700" />
              LEARN THE RULES OF PSYCHOLOGICAL WARFARE
              <div className="ml-5 text-4xl group-hover:animate-bounce transition-all duration-500">♔</div>
            </div>
          </button>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0.9; transform: translateY(5px) scale(0.98); }
          20% { opacity: 1; transform: translateY(-2px) scale(1.02); }
          50% { opacity: 1; transform: translateY(0px) scale(1); }
          80% { opacity: 1; transform: translateY(-1px) scale(1.01); }
          100% { opacity: 0.9; transform: translateY(3px) scale(0.99); }
        }
        
        @keyframes glitch {
          0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.3; 
            filter: hue-rotate(0deg); 
          }
          10% { 
            transform: translate(-2px, 1px) scale(1.02); 
            opacity: 0.5; 
            filter: hue-rotate(90deg); 
          }
          20% { 
            transform: translate(2px, -1px) scale(0.98); 
            opacity: 0.2; 
            filter: hue-rotate(180deg); 
          }
          30% { 
            transform: translate(-1px, 2px) scale(1.05); 
            opacity: 0.6; 
            filter: hue-rotate(270deg); 
          }
          40% { 
            transform: translate(1px, -2px) scale(0.95); 
            opacity: 0.3; 
            filter: hue-rotate(360deg); 
          }
          50% { 
            transform: translate(-2px, -1px) scale(1.03); 
            opacity: 0.4; 
            filter: hue-rotate(45deg); 
          }
          60% { 
            transform: translate(2px, 1px) scale(0.97); 
            opacity: 0.7; 
            filter: hue-rotate(135deg); 
          }
          70% { 
            transform: translate(-1px, -2px) scale(1.01); 
            opacity: 0.2; 
            filter: hue-rotate(225deg); 
          }
          80% { 
            transform: translate(1px, 2px) scale(1.04); 
            opacity: 0.5; 
            filter: hue-rotate(315deg); 
          }
          90% { 
            transform: translate(-2px, 0px) scale(0.99); 
            opacity: 0.3; 
            filter: hue-rotate(90deg); 
          }
          100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.3; 
            filter: hue-rotate(0deg); 
          }
        }@keyframes patternShift {
          0% { 
            transform: translateX(0) translateY(0) rotate(0deg); 
            opacity: 0.3; 
          }
          25% { 
            transform: translateX(10px) translateY(-5px) rotate(90deg); 
            opacity: 0.4; 
          }
          50% { 
            transform: translateX(0) translateY(-10px) rotate(180deg); 
            opacity: 0.5; 
          }
          75% { 
            transform: translateX(-10px) translateY(-5px) rotate(270deg); 
            opacity: 0.4; 
          }
          100% { 
            transform: translateX(0) translateY(0) rotate(360deg); 
            opacity: 0.3; 
          }
        }
      `}</style>
    </div>
  );
}