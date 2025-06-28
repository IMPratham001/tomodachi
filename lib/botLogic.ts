import { generateId } from './encryption';

export interface BotPersonality {
  difficulty: 'easy' | 'medium' | 'nightmare';
  name: string;
  emotions: string[];
  secretWritingStyle: 'believable' | 'dramatic' | 'psychological';
  manipulationTactics: string[];
  chatMessages: string[];
}

export const BOT_PERSONALITIES: Record<string, BotPersonality> = {
  'novice-demon': {
    difficulty: 'easy',
    name: 'Naive Nancy',
    emotions: ['😊 Confident', '😐 Neutral', '🤔 Thinking', '😅 Nervous'],
    secretWritingStyle: 'believable',
    manipulationTactics: ['basic bluffing', 'obvious tells'],
    chatMessages: [
      'I hope we can all be friends!',
      'This is fun!',
      'I don\'t know what to do...',
      'Good luck everyone!'
    ]
  },
  'cunning-demon': {
    difficulty: 'medium',
    name: 'Cunning Carl',
    emotions: ['😏 Smug', '😰 Nervous', '🎭 Mysterious', '😤 Determined', '🤫 Secretive'],
    secretWritingStyle: 'dramatic',
    manipulationTactics: ['fake emotions', 'strategic targeting', 'psychological pressure'],
    chatMessages: [
      'Interesting choice...',
      'I wouldn\'t do that if I were you...',
      'Someone here is lying...',
      'Trust me, I know what I\'m doing.',
      'This is getting dangerous...'
    ]
  },
  'master-demon': {
    difficulty: 'nightmare',
    name: 'Soul Crusher',
    emotions: ['👹 Menacing', '😈 Sinister', '🔥 Ruthless', '💀 Deadly', '🎪 Chaotic', '🧠 Calculating'],
    secretWritingStyle: 'psychological',
    manipulationTactics: ['perfect poker face', 'devastating secrets', 'mind games', 'trust destruction'],
    chatMessages: [
      'Your fear is delicious...',
      'I can see right through you.',
      'This game is already over.',
      'You should have never trusted anyone.',
      'I know all your secrets...',
      'Betrayal is an art form.',
      'Your paranoia is justified.'
    ]
  }
};

export class BotAI {
  private personality: BotPersonality;
  private currentEmotion: string;
  private trustScores: Map<string, number> = new Map();
  private suspicionLevels: Map<string, number> = new Map();
  private knownSecrets: Array<{ target: string; secret: string; author: string }> = [];

  constructor(difficulty: 'easy' | 'medium' | 'nightmare') {
    const personalityKey = difficulty === 'easy' ? 'novice-demon' : 
                          difficulty === 'medium' ? 'cunning-demon' : 'master-demon';
    this.personality = BOT_PERSONALITIES[personalityKey];
    this.currentEmotion = this.getRandomEmotion();
  }

  private getRandomEmotion(): string {
    return this.personality.emotions[Math.floor(Math.random() * this.personality.emotions.length)];
  }

  private getRandomChatMessage(): string {
    return this.personality.chatMessages[Math.floor(Math.random() * this.personality.chatMessages.length)];
  }

  // Generate a secret about a target player
  generateSecret(targetPlayer: string, gameContext: any): string {
    const secretTemplates = {
      believable: [
        `${targetPlayer} once told me they cheated on a test`,
        `${targetPlayer} secretly doesn't like one of their friends`,
        `${targetPlayer} has a crush on someone they won't admit`,
        `${targetPlayer} lied about being sick to skip work`
      ],
      dramatic: [
        `${targetPlayer} has been spreading rumors about everyone`,
        `${targetPlayer} is planning to betray their closest friend`,
        `${targetPlayer} has a dark secret they're hiding from everyone`,
        `${targetPlayer} is not who they pretend to be`
      ],
      psychological: [
        `${targetPlayer}'s greatest fear is being abandoned by everyone they trust`,
        `${targetPlayer} manipulates people by pretending to be vulnerable`,
        `${targetPlayer} enjoys watching others suffer in silence`,
        `${targetPlayer} has already decided who they want to destroy in this game`
      ]
    };

    const templates = secretTemplates[this.personality.secretWritingStyle];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Decide which player to draw from
  chooseTarget(availablePlayers: any[], gameState: any): string {
    switch (this.personality.difficulty) {
      case 'easy':
        // Random choice
        return availablePlayers[Math.floor(Math.random() * availablePlayers.length)].id;
      
      case 'medium':
        // Target players with more cards or higher trust scores
        const sortedPlayers = availablePlayers.sort((a, b) => 
          (b.cardsInHand * 0.7 + b.trustScore * 0.3) - (a.cardsInHand * 0.7 + a.trustScore * 0.3)
        );
        return sortedPlayers[0].id;
      
      case 'nightmare':
        // Complex strategy: target based on psychological profile
        const strategicTarget = this.calculateStrategicTarget(availablePlayers, gameState);
        return strategicTarget;
      
      default:
        return availablePlayers[0].id;
    }
  }

  private calculateStrategicTarget(players: any[], gameState: any): string {
    // Nightmare AI considers multiple factors:
    // 1. Player with most cards (higher chance of secrets)
    // 2. Player with highest trust (more to lose)
    // 3. Player who hasn't been targeted recently
    // 4. Strategic elimination order

    let bestTarget = players[0];
    let bestScore = 0;

    for (const player of players) {
      let score = 0;
      
      // Factor 1: Card count (30% weight)
      score += (player.cardsInHand / 10) * 30;
      
      // Factor 2: Trust score (25% weight)
      score += (player.trustScore / 100) * 25;
      
      // Factor 3: Psychological pressure (20% weight)
      const suspicion = this.suspicionLevels.get(player.id) || 0;
      score += (1 - suspicion / 100) * 20;
      
      // Factor 4: Strategic value (25% weight)
      if (player.trustScore > 70) score += 25; // Target high-trust players
      if (player.cardsInHand === 1) score += 15; // Potential elimination
      
      if (score > bestScore) {
        bestScore = score;
        bestTarget = player;
      }
    }

    return bestTarget.id;
  }

  // Generate emotional response to game events
  reactToEvent(eventType: string, eventData: any): { emotion: string; message?: string } {
    let newEmotion = this.currentEmotion;
    let message = '';

    switch (eventType) {
      case 'secret-revealed':
        if (eventData.target === this.personality.name) {
          // Bot's secret was revealed
          newEmotion = this.personality.difficulty === 'nightmare' ? '😈 Sinister' : '😰 Exposed';
          message = this.personality.difficulty === 'nightmare' ? 
            'You think that hurts me? How naive...' : 
            'That... that wasn\'t supposed to come out...';
        } else {
          // Someone else's secret was revealed
          newEmotion = this.personality.difficulty === 'nightmare' ? '👹 Menacing' : '😏 Amused';
          message = this.getRandomChatMessage();
        }
        break;
      
      case 'card-drawn':
        if (eventData.drawer === this.personality.name) {
          // Bot drew a card
          newEmotion = this.getRandomEmotion();
          if (Math.random() < 0.3) { // 30% chance to comment
            message = this.getRandomChatMessage();
          }
        } else if (eventData.target === this.personality.name) {
          // Someone drew from bot
          newEmotion = this.personality.difficulty === 'nightmare' ? '🔥 Ruthless' : '😤 Annoyed';
          if (Math.random() < 0.4) { // 40% chance to react
            message = this.personality.difficulty === 'nightmare' ? 
              'Interesting choice... you\'ll regret that.' : 
              'Hey! Why me?';
          }
        }
        break;
      
      case 'turn-start':
        // Bot's turn started
        newEmotion = this.getRandomEmotion();
        if (Math.random() < 0.2) { // 20% chance to comment
          message = this.personality.difficulty === 'nightmare' ? 
            'Time to make someone suffer...' : 
            'My turn! Let me think...';
        }
        break;
    }

    this.currentEmotion = newEmotion;
    return { emotion: newEmotion, message };
  }

  // Update bot's knowledge and suspicion levels
  updateGameKnowledge(gameState: any): void {
    // Track revealed secrets
    for (const secret of gameState.revealedSecrets) {
      if (!this.knownSecrets.find(s => s.secret === secret.secret)) {
        this.knownSecrets.push(secret);
      }
    }

    // Update trust assessments
    for (const player of gameState.players) {
      this.trustScores.set(player.id, player.trustScore);
    }

    // Adjust suspicion levels based on behavior patterns
    this.analyzeBehaviorPatterns(gameState);
  }

  private analyzeBehaviorPatterns(gameState: any): void {
    // Nightmare AI analyzes player behavior to adjust strategy
    if (this.personality.difficulty === 'nightmare') {
      for (const player of gameState.players) {
        if (!player.isBot) {
          let suspicion = this.suspicionLevels.get(player.id) || 50;
          
          // Increase suspicion for players who target the bot frequently
          // Decrease suspicion for players who avoid the bot
          // Adjust based on revealed secrets and trust changes
          
          this.suspicionLevels.set(player.id, Math.max(0, Math.min(100, suspicion)));
        }
      }
    }
  }

  // Get current bot state for display
  getCurrentState(): { emotion: string; difficulty: string; name: string } {
    return {
      emotion: this.currentEmotion,
      difficulty: this.personality.difficulty,
      name: this.personality.name
    };
  }

  // Generate fake emotional tells for manipulation
  generateFakeEmotion(context: 'drawing' | 'being-drawn-from' | 'secret-revealed'): string {
    if (this.personality.difficulty === 'easy') {
      // Easy bots show real emotions
      return this.currentEmotion;
    }

    const fakeEmotions = {
      drawing: ['😰 Nervous', '🤔 Uncertain', '😅 Hesitant'],
      'being-drawn-from': ['😊 Confident', '😏 Smug', '🤫 Mysterious'],
      'secret-revealed': ['😱 Shocked', '😰 Worried', '😤 Angry']
    };

    if (this.personality.difficulty === 'nightmare' && Math.random() < 0.7) {
      // Nightmare bots often show fake emotions to manipulate
      return fakeEmotions[context][Math.floor(Math.random() * fakeEmotions[context].length)];
    }

    return this.currentEmotion;
  }
}

export function createBot(difficulty: 'easy' | 'medium' | 'nightmare'): any {
  const botNames = {
    easy: ['Naive Nancy', 'Simple Sam', 'Trusting Tom', 'Innocent Ivy'],
    medium: ['Cunning Carl', 'Sly Sarah', 'Devious Dave', 'Tricky Tina'],
    nightmare: ['Soul Crusher', 'Mind Breaker', 'Trust Destroyer', 'Nightmare King', 'Demon Lord']
  };

  const names = botNames[difficulty];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return {
    id: generateId(),
    nickname: name,
    socketId: `bot-${generateId()}`,
    trustScore: difficulty === 'easy' ? 90 : difficulty === 'medium' ? 75 : 60,
    cards: [],
    secrets: [],
    isReady: true,
    isHost: false,
    isEliminated: false,
    isBot: true,
    botDifficulty: difficulty,
    botEmotion: BOT_PERSONALITIES[difficulty === 'easy' ? 'novice-demon' : 
                                   difficulty === 'medium' ? 'cunning-demon' : 'master-demon']
                  .emotions[0],
    ai: new BotAI(difficulty)
  };
}