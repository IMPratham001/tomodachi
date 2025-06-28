'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@game/hooks/useSocket';
import { Button } from '@game/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@game/components/ui/card';
import { Avatar, AvatarFallback } from '@game/components/ui/avatar';
import { Crown, User, Swords } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@game/components/ui/dialog';

interface Player {
  _id: string;
  nickname: string;
  hand: any[]; 
  isBot: boolean;
}

interface GameRoom {
  _id: string;
  roomCode: string;
  players: Player[];
  status: 'waiting' | 'in-progress' | 'finished';
  currentTurn?: string;
  host: string;
  loser?: string;
}

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('room');
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [myHand, setMyHand] = useState<any[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [loser, setLoser] = useState<Player | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomCreated = ({ roomCode, playerId }: { roomCode: string; playerId: string; }) => {
      router.push(`/game?room=${roomCode}`);
      setMyPlayerId(playerId);
    };

    const handleRoomJoined = ({ roomCode, playerId }: { roomCode: string; playerId: string; }) => {
      setMyPlayerId(playerId);
    }

    const handleRoomUpdate = (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);
    };

    const handleYourHand = (hand: any[]) => {
      setMyHand(hand);
    };
    
    const handleGameStarted = (gameRoom: GameRoom) => {
      setRoom(gameRoom);
      setLoser(null);
    };

    const handleGameOver = (finishedRoom: GameRoom) => {
        const loserPlayer = finishedRoom.players.find(p => p._id === finishedRoom.loser);
        setLoser(loserPlayer || null);
    };

    socket.on('player-joined', handleRoomUpdate);
    socket.on('player-left', handleRoomUpdate);
    socket.on('game-started', handleGameStarted);
    socket.on('game-state-update', handleRoomUpdate);
    socket.on('your-hand', handleYourHand);
    socket.on('game-over', handleGameOver);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);

    // Need a way to get initial room state and my player ID
    // This could be done on join/create confirmation

    return () => {
      socket.off('player-joined', handleRoomUpdate);
      socket.off('player-left', handleRoomUpdate);
      socket.off('game-started', handleGameStarted);
      socket.off('game-state-update', handleRoomUpdate);
      socket.off('your-hand', handleYourHand);
      socket.off('game-over', handleGameOver);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
    };
  }, [socket, isConnected, roomCode, router]);

  const startGame = () => {
    if (socket && room) {
      socket.emit('start-game', { roomCode: room.roomCode });
    }
  };

  const drawCard = (targetPlayerId: string) => {
    if (socket && room) {
      socket.emit('draw-card', { 
        roomCode: room.roomCode,
        fromPlayerId: targetPlayerId,
      });
    }
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  }

  const isMyTurn = myPlayerId && room?.currentTurn === myPlayerId;
  const isHost = myPlayerId && room?.host === myPlayerId;
  const canStartGame = isHost && room?.status === 'waiting' && room?.players.length > 1;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-4">Old Maid</h1>
      {room ? (
        <div>
          <div className="text-center mb-4">
            <p className="text-lg">Room Code: <span className="font-bold">{room.roomCode}</span></p>
            <p className="text-lg">Status: <span className="font-bold">{room.status}</span></p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {room.players.map(player => {
              const isTarget = isMyTurn && player._id !== myPlayerId && player.hand?.length > 0;
              return (
                <Card 
                  key={player._id} 
                  className={`${room.currentTurn === player._id ? 'border-4 border-blue-500 shadow-lg' : 'border'} ${isTarget ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => isTarget && drawCard(player._id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {room.host === player._id && <Crown className="w-5 h-5 text-yellow-500" />}
                      {player.nickname}
                      {player._id === myPlayerId && " (You)"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">Cards: {player.hand ? player.hand.length : '?'}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {room.status === 'waiting' && (
            <div className="text-center">
              {canStartGame ? (
                <Button onClick={startGame} size="lg"><Swords className="mr-2" />Start Game</Button>
              ) : (
                <p>Waiting for more players... {isHost && "(You are the host)"}</p>
              )}
            </div>
          )}

          {room.status === 'in-progress' && (
             <div className="mt-8">
                <h2 className="text-2xl font-bold text-center mb-4">Your Hand</h2>
                <div className="flex justify-center flex-wrap gap-4 p-4 bg-gray-200 rounded-lg min-h-[16rem]">
                  {myHand.map((card, index) => (
                    <div key={index} className="flex items-center justify-center w-24 h-36 bg-white rounded-lg shadow-xl border-2 border-gray-300 transform transition-transform hover:scale-105">
                      <div className="text-center">
                        <span className={`text-5xl font-bold ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
                            {card.isJoker ? 'JOKER' : card.value}
                        </span>
                        <span className={`text-3xl ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
                          {getSuitSymbol(card.suit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

        </div>
      ) : (
        <p>Joining room...</p>
      )}

      <Dialog open={room?.status === 'finished'} onOpenChange={() => { if (room?.status === 'finished') setRoom(null); router.push('/')}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
            <DialogDescription>
              {loser ? `${loser.nickname} is the Old Maid!` : 'The game has ended.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setRoom(null); router.push('/')}}>
                Back to Lobby
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}