export interface Card {
  suit: string;
  value: string;
  isJoker?: boolean;
}

export const SUITS = ["hearts", "diamonds", "clubs", "spades"];
export const VALUES = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

/**
 * Creates a standard 52-card deck plus one joker.
 * @returns {Card[]} An array of cards representing the deck.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  deck.push({ suit: "joker", value: "joker", isJoker: true });
  return deck;
}

/**
 * Shuffles an array of cards in place.
 * @param {Card[]} deck The deck of cards to shuffle.
 */
export function shuffleDeck(deck: Card[]): void {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

/**
 * Deals cards from a deck to a list of players.
 * @param {Card[]} deck The deck of cards to deal from.
 * @param {any[]} players The players to deal to.
 * @returns {{ hands: Card[][], remainingDeck: Card[] }} The hands of the players and the remaining deck.
 */
export function dealCards(
  deck: Card[],
  playerCount: number
): { hands: Card[][]; remainingDeck: Card[] } {
  const hands: Card[][] = Array(playerCount)
    .fill(0)
    .map(() => []);
  let deckIndex = 0;

  while (deckIndex < deck.length) {
    for (let i = 0; i < playerCount && deckIndex < deck.length; i++) {
      hands[i].push(deck[deckIndex++]);
    }
  }

  return { hands, remainingDeck: [] };
}

/**
 * Removes all pairs of cards from a hand.
 * @param {Card[]} hand The hand to remove pairs from.
 * @returns {{ hand: Card[], pairs: Card[][] }} The hand after removing pairs and the pairs that were removed.
 */
export function removePairs(hand: Card[]): {
  hand: Card[];
  pairs: Card[][];
} {
  const counts: { [key: string]: Card[] } = {};
  const pairs: Card[][] = [];
  const singles: Card[] = [];

  // Group cards by value
  for (const card of hand) {
    if (card.isJoker) {
      singles.push(card);
      continue;
    }
    if (!counts[card.value]) {
      counts[card.value] = [];
    }
    counts[card.value].push(card);
  }

  // Find pairs and singles
  for (const value in counts) {
    let group = counts[value];
    while (group.length >= 2) {
      pairs.push(group.splice(0, 2));
    }
    if (group.length > 0) {
      singles.push(...group);
    }
  }

  return { hand: singles, pairs };
}