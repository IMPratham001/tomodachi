'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@game/components/ui/card';
import { Button } from '@game/components/ui/button';
import { Badge } from '@game/components/ui/badge';
import { Avatar, AvatarFallback } from '@game/components/ui/avatar';
import { Progress } from '@game/components/ui/progress';
import { Separator } from '@game/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@game/components/ui/select';
import { 
  Users, 
  Copy, 
  Play, 
  Crown, 
  Clock, 
  ArrowLeft, 
  Bot, 
  Skull,
  Brain,
  AlertTriangle,
  Settings,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '@game/hooks/useSocket';
import { motion } from "framer-motion";

interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  trustScore: number;
  isReady: boolean;
  isBot?: boolean;
  botDifficulty?: 'easy' | 'medium' | 'nightmare';
  botEmotion?: string;
}

interface GameRoom {
  id: string;
  code: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  createdAt: string;
  botSettings?: {
    enabled: boolean;
    difficulty: 'easy' | 'medium' | 'nightmare';
    count: number;
  };
}

const PSYCHOLOGICAL_MESSAGES = [
  "Who among you will be the first to betray?",
  "Trust is about to become your greatest weakness...",
  "Someone here is already planning your downfall...",
  "The game hasn't started, but the manipulation has...",
  "Look around. One of these faces will haunt your nightmares...",
  "Friendship ends when the cards are dealt..."
];

const BOT_EMOTIONS = {
  easy: ["😊 Confident", "😐 Neutral", "🤔 Thinking"],
  medium: ["😏 Smug", "😰 Nervous", "🎭 Mysterious", "😤 Determined"],
  nightmare: ["👹 Menacing", "😈 Sinister", "🔥 Ruthless", "💀 Deadly", "🎪 Chaotic"]
};

const BOT_NAMES = {
  easy: ["Naive Nancy", "Simple Sam", "Trusting Tom"],
  medium: ["Cunning Carl", "Sly Sarah", "Devious Dave", "Tricky Tina"],
  nightmare: ["Demon Lord", "Soul Crusher", "Mind Breaker", "Trust Destroyer", "Nightmare King"]
};

export default function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname');
  const roomCode = searchParams.get('room');
  const shouldCreate = searchParams.get('create') === 'true';
  const withBots = searchParams.get('bots') === 'true';
  
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'nightmare'>('medium');
  
  const { socket, isConnected } = useSocket();

  // Cycle through psychological messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % PSYCHOLOGICAL_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomCreated = (roomData: GameRoom) => {
      setRoom(roomData);
      setLoading(false);
      if (withBots) {
        toast.success('Betrayal chamber created with AI demons!', {
          description: 'The bots are already plotting against you...'
        });
      } else {
        toast.success('Betrayal chamber created!', {
          description: 'Invite others to begin the psychological warfare.'
        });
      }
    };

    const handleRoomJoined = (roomData: GameRoom) => {
      setRoom(roomData);
      setLoading(false);
      toast.success(`Infiltrated chamber ${roomData.code}`, {
        description: `You've joined as ${nickname}.`
      });
    };

    const handleRoomUpdated = (roomData: GameRoom) => {
      setRoom(roomData);
    };

    const handleGameStarting = (seconds: number) => {
      setCountdown(seconds);
      toast.error('The nightmare begins...', {
        description: `Game starting in ${seconds} seconds`
      });
    };

    const handleGameStarted = (roomCode: string) => {
      router.push(`/game?room=${roomCode}`);
    };

    const handleBotEmotion = (data: { botId: string; emotion: string; message: string }) => {
      const botPlayer = room?.players.find(p => p.id === data.botId);
      if (botPlayer) {
        toast.info(`${botPlayer.nickname}: ${data.emotion}`, {
          description: data.message,
          duration: 3000
        });
      }
    };

    const handleError = (error: { message: string }) => {
      toast.error('An error occurred', {
        description: error.message,
      });
      setLoading(false);
      router.push('/');
    };
    
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-updated', handleRoomUpdated);
    socket.on('game-starting', handleGameStarting);
    socket.on('game-started', handleGameStarted);
    socket.on('bot-emotion', handleBotEmotion);
    socket.on('error', handleError);

    return () => {
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-updated', handleRoomUpdated);
      socket.off('game-starting', handleGameStarting);
      socket.off('game-started', handleGameStarted);
      socket.off('bot-emotion', handleBotEmotion);
      socket.off('error', handleError);
    };
  }, [socket, isConnected, router, withBots, nickname, room?.players]);
  
  useEffect(() => {
    if (!nickname) {
      router.push('/');
      return;
    }

    if (!socket || !isConnected) return;

    if (shouldCreate) {
      const roomData = withBots 
        ? { nickname, botSettings: { enabled: true, difficulty: botDifficulty, count: 2 } }
        : { nickname };
      socket.emit('create-room', roomData);
    } else if (roomCode) {
      socket.emit('join-room', { roomCode, nickname });
    }
  }, [socket, isConnected, nickname, roomCode, shouldCreate, withBots, botDifficulty, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const copyRoomCode = useCallback(() => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      toast.success('Room code copied!', {
        description: 'Share this code to invite others to your betrayal chamber'
      });
    }
  }, [room?.code]);

  const toggleReady = useCallback(() => {
    if (socket && room) {
      socket.emit('toggle-ready', { roomCode: room.code });
    }
  }, [socket, room]);

  const startGame = useCallback(() => {
    if (socket && room) {
      socket.emit('start-game', { roomCode: room.code });
    }
  }, [socket, room]);

  const addBot = useCallback(() => {
    if (socket && room) {
      socket.emit('add-bot', { roomCode: room.code, difficulty: botDifficulty });
    }
  }, [socket, room, botDifficulty]);

  const removeBot = useCallback((bot: Player) => {
    if (socket && room) {
      socket.emit('remove-bot', { roomCode: room.code, botId: bot.id });
    }
  }, [socket, room]);

  const currentPlayer = room?.players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;
  const canStartGame = room && room.players.length >= 3 && room.players.length <= 5 && room.players.every(p => p.isReady);
  const botCount = room?.players.filter(p => p.isBot).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-400">
            {shouldCreate ? 'Creating betrayal chamber...' : 'Infiltrating room...'}
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md thriller-card">
          <CardContent className="p-6 text-center">
            <Skull className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-xl font-bold text-red-400 mb-2">Connection Severed</p>
            <p className="text-gray-400 mb-6">Failed to enter or maintain connection to the nightmare.</p>
            <Button onClick={() => router.push('/')} className="w-full bg-red-800 hover:bg-red-700">
              Return to Safety
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,20,60,0.1),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-red-500 tracking-wider">TOMODACHI</h1>
          {countdown > 0 ? (
            <div className="flex items-center gap-2 text-red-400 sinister-glow">
              <Clock className="h-5 w-5 animate-pulse" />
              <span className="font-medium text-lg">Nightmare begins in {countdown}s</span>
            </div>
          ) : (
            <div className="text-center">
              <div className="psychological-message p-3 rounded-lg max-w-2xl mx-auto">
                <p className="manipulation-text text-sm sm:text-base">
                  {PSYCHOLOGICAL_MESSAGES[currentMessage]}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Players and Room Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="thriller-card border-red-600/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <Skull className="h-6 w-6" />
                      Betrayal Chamber
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      The psychological warfare is about to begin...
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-red-400 border-red-600/50">
                    {room.players.length}/{room.maxPlayers} Victims
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-300">Chamber Code</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyRoomCode}
                      className="h-8 border-red-600/50 text-red-400 hover:bg-red-950/20"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {room.code}
                    </Button>
                  </div>
                  <Progress 
                    value={(room.players.length / room.maxPlayers) * 100} 
                    className="h-3 bg-black border border-red-900/50"
                  />
                </div>

                <Separator className="my-4 bg-red-900/30" />

                {/* Players List */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-red-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Players & AI Demons
                  </h3>
                    <div className="space-y-2">
                      {room.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className={`border-2 ${player.isHost ? 'border-red-500' : 'border-gray-600'}`}>
                              {player.nickname.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className={`font-medium ${player.id === socket?.id ? 'text-red-400' : 'text-white'}`}>
                              {player.nickname}
                              {player.isBot && <Bot className="h-4 w-4 inline-block ml-2 text-purple-400" />}
                            </span>
                            <span className="text-xs text-gray-400">
                              {player.isHost ? 'Chamber Host' : 'Contestant'}
                              {player.isBot && ` (${player.botDifficulty})`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {player.isReady ? (
                            <Badge variant="outline" className="text-green-400 border-green-500/50">
                              Ready
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not Ready</Badge>
                          )}
                          {isHost && player.isBot && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBot(player)}
                              className="bg-red-900/50 hover:bg-red-900/80"
                            >
                              Remove
                            </Button>
                          )}
                          {player.isHost && <Crown className="h-5 w-5 text-yellow-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Controls and Actions */}
          <div className="space-y-6">
            {isHost && (
              <Card className="thriller-card">
                <CardHeader>
                  <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Host Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-black/30">
                    <h4 className="font-medium text-sm text-red-300 mb-2 flex items-center gap-2">
                      <Bot className="h-4 w-4" /> Summon AI Demon
                    </h4>
                    <Select value={botDifficulty} onValueChange={(value: any) => setBotDifficulty(value)}>
                      <SelectTrigger className="w-full bg-black/50 border-red-900/50">
                        <SelectValue placeholder="Select Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="nightmare">Nightmare</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={addBot} 
                      disabled={botCount >= 4 || room.players.length >= 5}
                      className="w-full mt-2 bg-purple-900 hover:bg-purple-800"
                    >
                      Add AI Demon
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Max 5 players total. Max 4 bots.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="thriller-card">
              <CardHeader>
                <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isHost ? (
                  <Button
                    onClick={startGame}
                    disabled={!canStartGame}
                    className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white sinister-glow"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {canStartGame ? 'Begin Betrayal' : `Need ${3 - room.players.length} More`}
                  </Button>
                ) : (
                  <Button
                    onClick={toggleReady}
                    className={`w-full text-white ${currentPlayer?.isReady ? 'bg-green-700 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    size="lg"
                  >
                    {currentPlayer?.isReady ? 'Ready to Betray' : 'Signal Readiness'}
                  </Button>
                )}

                <Button variant="outline" onClick={() => router.push('/')} className="w-full border-red-600/50 text-red-400 hover:bg-red-900/20">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Flee the Chamber
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}