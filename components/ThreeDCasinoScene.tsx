import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Html, SpotLight, Environment, Sparkles } from '@react-three/drei';
import casinoVelvet from '../public/Images/ayanokoji/b89ae50516ccb45f4ac9cb0bf025bcd3.jpg'; // Example velvet texture
import { TextureLoader } from 'three';

// Simple 3D chess piece (stylized)
function ChessPiece({ position = [0, 0, 0], color = '#fff', type = 'pawn', ...props }) {
  // Use different shapes for different types
  return (
    <group position={position} {...props}>
      {type === 'king' && (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.22, 1, 32]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
      )}
      {type === 'queen' && (
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.22, 0.08, 16, 100]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      )}
      {type === 'rook' && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.32, 0.7, 0.32]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
        </mesh>
      )}
      {type === 'bishop' && (
        <mesh castShadow receiveShadow>
          <coneGeometry args={[0.18, 0.7, 32]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
      )}
      {type === 'knight' && (
        <mesh castShadow receiveShadow>
          <torusKnotGeometry args={[0.18, 0.08, 100, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
      )}
      {type === 'pawn' && (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

// 3D Card (simple box with suit/face)
function PlayingCard({ position = [0, 0, 0], rotation = [0, 0, 0], suit = 'spades', rank = 'A', color = '#fff', ...props }) {
  // Card face as HTML overlay
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow {...props}>
      <boxGeometry args={[0.7, 0.01, 1]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      <Html position={[0, 0.06, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          width: '70px', height: '100px',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '10px',
          border: '2px solid gold',
          boxShadow: '0 0 16px #ffd700',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem', fontWeight: 700, color: suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#222',
          fontFamily: 'Cinzel Decorative, serif',
          letterSpacing: '0.1em',
          textShadow: '0 0 8px #ffd700, 0 0 16px #fff',
        }}>
          {rank}
          <span style={{ fontSize: '1.5rem' }}>{suit === 'spades' ? '♠' : suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : '♣'}</span>
        </div>
      </Html>
    </mesh>
  );
}

// 3D Chessboard with pieces
function Chessboard3D() {
  // 8x8 board
  const squares = [];
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      const isDark = (x + z) % 2 === 1;
      squares.push(
        <mesh key={`sq-${x}-${z}`} position={[x - 3.5, 0, z - 3.5]} receiveShadow>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color={isDark ? '#2a0015' : '#ffd700'} metalness={0.4} roughness={0.7} />
        </mesh>
      );
    }
  }
  // Place a few stylized pieces
  return (
    <group>
      {squares}
      {/* Kings */}
      <ChessPiece position={[-3, 0.25, -3]} color="#fff" type="king" />
      <ChessPiece position={[3, 0.25, 3]} color="#dc2626" type="king" />
      {/* Queens */}
      <ChessPiece position={[-2, 0.25, -3]} color="#fffbe6" type="queen" />
      <ChessPiece position={[2, 0.25, 3]} color="#ffd700" type="queen" />
      {/* Knights */}
      <ChessPiece position={[-1, 0.25, -3]} color="#fff" type="knight" />
      <ChessPiece position={[1, 0.25, 3]} color="#dc2626" type="knight" />
      {/* Pawns */}
      {[...Array(8)].map((_, i) => (
        <ChessPiece key={`pawn-w-${i}`} position={[-3.5 + i, 0.25, -2]} color="#fff" type="pawn" />
      ))}
      {[...Array(8)].map((_, i) => (
        <ChessPiece key={`pawn-b-${i}`} position={[-3.5 + i, 0.25, 2]} color="#dc2626" type="pawn" />
      ))}
    </group>
  );
}

// Camera animation logic must be inside a Canvas child
function CameraController() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.2) * 12;
    camera.position.z = Math.cos(t * 0.2) * 12;
    camera.position.y = 7 + Math.sin(t * 0.1) * 1.5;
    camera.lookAt(0, 0.5, 0);
  });
  return null;
}

// Casino Table with velvet and gold trim
function CasinoTable() {
  // Load velvet texture
  const velvetMap = React.useMemo(() => new TextureLoader().load(casinoVelvet), []);
  return (
    <group>
      {/* Table Base */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[7.5, 7.5, 0.3, 64]} />
        <meshStandardMaterial 
          color="#3a0020" 
          metalness={0.2} 
          roughness={0.8} 
          map={velvetMap} 
          map-repeat={[4,4]}
        />
      </mesh>
      {/* Gold Trim */}
      <mesh position={[0, 0.01, 0]}>
        <torusGeometry args={[7.5, 0.08, 32, 128]} />
        <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.2} emissive="#fffbe6" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

// Casino Floor
function CasinoFloor() {
  return (
    <mesh receiveShadow position={[0, -0.31, 0]} rotation={[-Math.PI/2, 0, 0]}>
      <circleGeometry args={[18, 64]} />
      <meshStandardMaterial color="#1a0020" metalness={0.1} roughness={0.95} />
    </mesh>
  );
}

// Glassy UI Overlay
function CasinoOverlay() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2,
      pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(180deg, rgba(20,0,40,0.7) 0%, rgba(20,0,40,0.2) 60%, rgba(0,0,0,0.7) 100%)',
      fontFamily: 'Cinzel Decorative, serif',
    }}>
      <div style={{marginTop: 32, fontSize: 36, fontWeight: 900, color: '#ffd700', textShadow: '0 0 16px #fff, 0 0 32px #ffd700'}}>
        {/* Casino Logo Placeholder */}
        TOMODACHI CASINO
      </div>
      <div style={{marginBottom: 32, fontSize: 18, color: '#fffbe6', opacity: 0.7, letterSpacing: 2}}>
        Enjoy the Game!
      </div>
    </div>
  );
}

// Main 3D Casino Scene
export function ThreeDCasinoScene() {
  // Cards arranged around the chessboard, on the table
  const cards = [
    { pos: [-2.5, 0.11, -4.5], rot: [0, 0.1, 0.05], suit: 'spades', rank: 'A' },
    { pos: [2.5, 0.11, -4.2], rot: [0, -0.2, -0.05], suit: 'hearts', rank: 'K' },
    { pos: [-4.2, 0.11, 0.5], rot: [0, 0.5, 0.1], suit: 'diamonds', rank: 'Q' },
    { pos: [4.2, 0.11, 0.5], rot: [0, -0.5, -0.1], suit: 'clubs', rank: 'A' },
    { pos: [-2.5, 0.11, 4.2], rot: [0, 0.2, 0.05], suit: 'hearts', rank: 'Q' },
    { pos: [2.5, 0.11, 4.5], rot: [0, -0.1, -0.05], suit: 'spades', rank: 'K' },
    // Overlapping edge cards
    { pos: [0, 0.11, -5.2], rot: [0, 0, 0.08], suit: 'diamonds', rank: 'J' },
    { pos: [0, 0.11, 5.2], rot: [0, 0, -0.08], suit: 'clubs', rank: 'J' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse at 60% 40%, #2a0030 60%, #0a0010 100%)' }}>
      <CasinoOverlay />
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 40 }} gl={{ physicallyCorrectLights: true }}>
        <color attach="background" args={["#12001a"]} />
        <fog attach="fog" args={["#12001a", 18, 32]} />
        <CameraController />
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.45} color="#fffbe6" />
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={0.7} intensity={1.2} castShadow color="#ffd700" />
        <spotLight position={[-8, 8, 8]} angle={0.7} penumbra={0.8} intensity={0.7} color="#a78bfa" />
        <spotLight position={[8, 8, -8]} angle={0.7} penumbra={0.8} intensity={0.7} color="#38bdf8" />
        <Stage environment={null} intensity={0.22} shadows="contact">
          {/* Casino Table with velvet and gold trim */}
          <CasinoTable />
          {/* 3D Chessboard and Pieces */}
          <Chessboard3D />
          {/* 3D Cards on the table, around the chessboard */}
          {cards.map((card, i) => (
            <PlayingCard key={i} position={card.pos} rotation={card.rot} suit={card.suit} rank={card.rank} color="#fffbe6" />
          ))}
          {/* Casino Floor */}
          <CasinoFloor />
        </Stage>
        {/* Casino Sparkles and Bokeh */}
        <Sparkles count={120} scale={[18, 2, 18]} size={3.2} color="#ffd700" speed={0.7} />
        <Environment preset="night" background={false} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/2.1} minPolarAngle={Math.PI/3.2} dampingFactor={0.12} />
      </Canvas>
    </div>
  );
} 