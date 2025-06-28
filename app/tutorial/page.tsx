"use client";

import { useState } from 'react';
import { Button } from '@game/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@game/components/ui/card';
import { Avatar, AvatarFallback } from '@game/components/ui/avatar';
import { 
  ArrowLeft, 
  ArrowRight,
  Users,
  Bot,
  Crown,
  BookOpen,
  Shuffle,
  GitCompareArrows,
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@game/lib/utils';

const tutorialSteps = [
  {
    title: 'Welcome to Old Maid!',
    description: "This tutorial will walk you through the rules of the classic card game, Old Maid. Let's start with the players.",
    highlight: 'players',
  },
  {
    title: 'The Deck is Dealt',
    description: 'At the start, all 53 cards (a standard deck plus one Joker, the "Old Maid") are dealt out to the players. Your starting hand is shown below.',
    highlight: 'hand',
  },
  {
    title: 'Making Pairs',
    description: "Before play begins, all players find and discard any pairs of cards with the same rank (e.g., two Kings, two 7s) from their hand. You can't pair the Old Maid.",
    highlight: 'pairs',
  },
  {
    title: 'Taking a Turn',
    description: "On your turn, you will draw a single card from the player to your left. If that card makes a pair with a card in your hand, both are discarded.",
    highlight: 'draw',
  },
  {
    title: 'Winning and Losing',
    description: "The game continues until one player is left holding the single, unmatchable Old Maid card. The goal is to get rid of all your cards. The player with the Old Maid at the end is the loser!",
    highlight: 'finish',
  },
];

interface Player {
  id: string;
  name: string;
  isBot?: boolean;
  isHost?: boolean;
  cards: number;
}

interface GameCard {
  id: string;
  suit: string;
  rank: string;
  isOldMaid?: boolean;
}

const PlayerIcon = ({ player, highlight, children }: { player: Player, highlight: boolean, children?: React.ReactNode }) => (
  <div className={cn("flex items-center space-x-3 transition-all duration-300 p-2 rounded-lg", highlight && "scale-105 bg-blue-500/10")}>
    <Avatar className={cn("h-12 w-12", highlight && "ring-2 ring-blue-400")}>
      <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
    </Avatar>
    <div className="flex-grow">
      <div className="flex items-center space-x-2">
        <span className={cn("font-medium", highlight && "text-blue-300")}>{player.name}</span>
        {player.isBot && <Bot className="h-4 w-4 text-purple-400" />}
        {player.isHost && <Crown className="h-4 w-4 text-yellow-500" />}
      </div>
      {children}
    </div>
  </div>
);

const CardDisplay = ({ card, highlight, isPaired }: { card: GameCard, highlight: boolean, isPaired?: boolean }) => (
  <div className={cn(
    "aspect-[2.5/3.5] rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all duration-300", 
    highlight && "bg-blue-400/20 shadow-lg scale-110 ring-2 ring-blue-500",
    isPaired && "opacity-50 grayscale",
    "border border-gray-700 bg-gray-800/60"
  )}>
    <span className="text-2xl font-bold">{card.rank}</span>
    <span className="text-lg">{card.suit}</span>
  </div>
);

export default function TutorialPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const currentStep = tutorialSteps[step];

  const mockPlayers: Player[] = [
    { id: 'you', name: 'You', cards: 13, isHost: true },
    { id: 'bob', name: 'Bob', isBot: true, cards: 13 },
    { id: 'carl', name: 'Carl', isBot: true, cards: 14 },
    { id: 'dave', name: 'Dave', isBot: true, cards: 13 },
  ];
  
  const initialHand: GameCard[] = [
      {id: 'c1', suit: '♠️', rank: 'A'},
      {id: 'c2', suit: '♥️', rank: 'A'},
      {id: 'c3', suit: '♦️', rank: '5'},
      {id: 'c4', suit: '♣️', rank: 'J'},
      {id: 'c5', suit: '🃏', rank: 'Joker', isOldMaid: true},
      {id: 'c6', suit: '♠️', rank: '10'},
      {id: 'c7', suit: '♦️', rank: 'Q'},
  ];

  const showPaired = step >= 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-900 text-white">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="bg-gray-800/50 border-gray-700 text-gray-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => router.push('/')} className="hover:bg-gray-700"><ArrowLeft className="mr-2"/> Back to Main Menu</Button>
              <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2"><BookOpen /> Old Maid Tutorial</h1>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-gray-900/70 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2">
                    <span className="text-3xl">{step + 1}</span> {currentStep.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 pt-2">{currentStep.description}</CardDescription>
                </CardHeader>
              </Card>
              <div className="flex justify-between">
                <Button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                  <ArrowLeft className="mr-2" /> Previous
                </Button>
                <Button onClick={() => setStep(s => Math.min(tutorialSteps.length - 1, s + 1))} disabled={step === tutorialSteps.length - 1}>
                  Next <ArrowRight className="ml-2" />
                </Button>
              </div>
               {step === tutorialSteps.length - 1 && (
                <Button onClick={() => router.push('/')} className="w-full bg-blue-600 hover:bg-blue-500 text-white" size="lg">
                  Let&apos;s Play!
                </Button>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 rounded-lg bg-black/30 border border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-gray-300 flex items-center gap-2"><Users /> Players</h3>
                {mockPlayers.map(p => (
                  <PlayerIcon key={p.id} player={p} highlight={currentStep.highlight === 'players' || (currentStep.highlight === 'draw' && p.id === 'bob')}>
                    {p.id !== 'you' && step >= 3 && (
                      <Button size="sm" variant="outline" className="w-full mt-2 border-gray-600 text-gray-300 hover:bg-gray-700/50" disabled={currentStep.highlight !== 'draw'}>
                        {currentStep.highlight === 'draw' && p.id === 'bob' ? <GitCompareArrows className="mr-2 h-4 w-4 animate-pulse" /> : <Shuffle className="mr-2 h-4 w-4" /> }
                        Draw from {p.name}
                      </Button>
                    )}
                  </PlayerIcon>
                ))}
              </div>
              
              <div className="p-4 rounded-lg bg-black/30 border border-gray-700 space-y-2">
                <h3 className="text-lg font-medium text-gray-300">Your Hand</h3>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                 {initialHand.map(c => 
                    <CardDisplay 
                      key={c.id} 
                      card={c} 
                      highlight={(currentStep.highlight === 'hand') || (currentStep.highlight === 'oldmaid' && !!c.isOldMaid) || (currentStep.highlight === 'pairs' && c.rank === 'A')}
                      isPaired={showPaired && c.rank === 'A'}
                    />)
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}