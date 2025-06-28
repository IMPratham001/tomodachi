"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePairs = exports.dealCards = exports.shuffleDeck = exports.createDeck = exports.VALUES = exports.SUITS = void 0;
exports.SUITS = ["hearts", "diamonds", "clubs", "spades"];
exports.VALUES = [
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
function createDeck() {
    var deck = [];
    for (var _i = 0, SUITS_1 = exports.SUITS; _i < SUITS_1.length; _i++) {
        var suit = SUITS_1[_i];
        for (var _a = 0, VALUES_1 = exports.VALUES; _a < VALUES_1.length; _a++) {
            var value = VALUES_1[_a];
            deck.push({ suit: suit, value: value });
        }
    }
    deck.push({ suit: "joker", value: "joker", isJoker: true });
    return deck;
}
exports.createDeck = createDeck;
/**
 * Shuffles an array of cards in place.
 * @param {Card[]} deck The deck of cards to shuffle.
 */
function shuffleDeck(deck) {
    var _a;
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [deck[j], deck[i]], deck[i] = _a[0], deck[j] = _a[1];
    }
}
exports.shuffleDeck = shuffleDeck;
/**
 * Deals cards from a deck to a list of players.
 * @param {Card[]} deck The deck of cards to deal from.
 * @param {any[]} players The players to deal to.
 * @returns {{ hands: Card[][], remainingDeck: Card[] }} The hands of the players and the remaining deck.
 */
function dealCards(deck, playerCount) {
    var hands = Array(playerCount)
        .fill(0)
        .map(function () { return []; });
    var deckIndex = 0;
    while (deckIndex < deck.length) {
        for (var i = 0; i < playerCount && deckIndex < deck.length; i++) {
            hands[i].push(deck[deckIndex++]);
        }
    }
    return { hands: hands, remainingDeck: [] };
}
exports.dealCards = dealCards;
/**
 * Removes all pairs of cards from a hand.
 * @param {Card[]} hand The hand to remove pairs from.
 * @returns {{ hand: Card[], pairs: Card[][] }} The hand after removing pairs and the pairs that were removed.
 */
function removePairs(hand) {
    var counts = {};
    var pairs = [];
    var singles = [];
    // Group cards by value
    for (var _i = 0, hand_1 = hand; _i < hand_1.length; _i++) {
        var card = hand_1[_i];
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
    for (var value in counts) {
        var group = counts[value];
        while (group.length >= 2) {
            pairs.push(group.splice(0, 2));
        }
        if (group.length > 0) {
            singles.push.apply(singles, group);
        }
    }
    return { hand: singles, pairs: pairs };
}
exports.removePairs = removePairs;
