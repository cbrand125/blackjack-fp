const readlineSync = require('readline-sync');

let continuePlaying = true;
while (continuePlaying) {
  let gameDeck = generateDeck();
  gameDeck = shuffle(gameDeck);

  let playerHand = [];
  playerHand = dealCards(playerHand, getTopCards(gameDeck, 2));
  gameDeck = removeTopCards(gameDeck, 2);

  let dealerHand = [];
  dealerHand = dealCards(dealerHand, getTopCards(gameDeck, 2));
  gameDeck = removeTopCards(gameDeck, 2);

  console.clear();
  console.log(`♣♥♦♠ WHACKJACK ♠♦♥♣`);
  console.log(`===================\n`);

  console.log("DEALER'S HAND");
  console.log(getHandDisplay(dealerHand, true));

  console.log("PLAYER'S HAND");
  console.log(getHandDisplay(playerHand));

  const naturalBlackjack = getHandValue(playerHand) === 21;
  let takeHit = !naturalBlackjack;
  while (takeHit) {
    takeHit = readlineSync.keyInYNStrict('Would you like to hit?');
    if (takeHit) {
      playerHand = dealCards(playerHand, getTopCards(gameDeck));
      console.log(`\nPlayer takes a card: ${toString(getTopCards(gameDeck))}`);
      gameDeck = removeTopCards(gameDeck);
      console.log("PLAYER'S HAND");
      console.log(getHandDisplay(playerHand));
    }
    if (getHandValue(playerHand) >= 21) {
      takeHit = false;
    }
  }

  const isPlayerBusted = getHandValue(playerHand) > 21;
  if (isPlayerBusted) {
    console.log('☹  PLAYER BUST! DEALER WINS! ☹');
  } else {
    console.log("\nDEALER'S HAND");
    console.log(getHandDisplay(dealerHand));

    if (!naturalBlackjack) {
      while (getHandValue(dealerHand) < 17) {
        dealerHand = dealCards(dealerHand, getTopCards(gameDeck));
        console.log(`Dealer takes a card: ${toString(getTopCards(gameDeck))}`);
        gameDeck = removeTopCards(gameDeck);
        console.log("DEALER'S HAND");
        console.log(getHandDisplay(dealerHand));
      }
    }

    const isDealerBusted = getHandValue(dealerHand) > 21;
    if (isDealerBusted) {
      console.log('*~*~*~*~* DEALER BUST! PLAYER WINS! *~*~*~*~*');
    } else if (getHandValue(playerHand) > getHandValue(dealerHand)) {
      console.log('*~*~*~*~* PLAYER WINS! *~*~*~*~*');
    } else if (getHandValue(playerHand) < getHandValue(dealerHand)) {
      console.log('☹  DEALER WINS! ☹');
    } else {
      console.log("IT'S A PUSH!");
    }
  }

  continuePlaying = readlineSync.keyInYNStrict('\nWould you like to play again?');
}

/**
 * gets a representation unshuffled deck of cards
 * @return {[{string,string}]} an array of tuples representing an unshuffled classic deck of cards
 */
function generateDeck() {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♠', '♦', '♥', '♣'];

  // populate deck by creating a card for each combination of rank and suit
  const deck = [];
  for (let i = 0; i < ranks.length; i++) {
    for (let j = 0; j < suits.length; j++) {
      deck.push({ rank: ranks[i], suit: suits[j] });
    }
  }
  return deck;
}

/**
 * puts a given deck array in a random order
 * @param {[{string,string}]} deck array of tuples representing a deck of cards
 * @return {[{string,string}]} array of tuples representing the shuffled deck
 */
function shuffle(deck) {
  return [...deck].sort(() => Math.random() - 0.5);
}

/**
 * gets the top card of a given deck
 * @param {[{string,string}]} deck array of tuples representing a hand
 * @returns {{string,string}} tuple representing the card at the top of the given deck
 */
function getTopCards(deck, amount = 1) {
  return deck.slice(deck.length - amount);
}

/**
 * removes a given number of cards from a deck array
 * @param {[{string, string}]} deck array of tuples representing a deck of cards
 * @param {number} amount number of cards to remove from deck
 * @returns {[{string,string}]} array of tuples representing the new deck
 */
function removeTopCards(deck, amount = 1) {
  return deck.slice(0, deck.length - amount);
}

/**
 * adds given cards to the given hand
 * @param {[{string, string}]} hand array of tuples representing a hand of cards
 * @param {[{string, string}]} card array of tuples representing the cards to add to hand
 * @return {[{string, string}]} array of tuples representing the new hand
 */
function dealCards(hand, cards) {
  return [...hand, ...cards];
}

/**
 * calculates the highest possible total value of given cards without busting
 * @param {[{string,string}]} cards array of tuples representing cards
 * @return {number} the total value of given cards in the game of blackjack
 */
function getHandValue(cards) {
  let aceCount = 0;
  let handValue = cards.reduce((total, card) => {
    const rankVal = parseInt(card.rank);
    if (rankVal) return total + rankVal;
    if (card.rank === 'A') {
      aceCount += 1;
      return total + 11;
    }
    return total + 10;
  }, 0);

  while (handValue > 21 && aceCount > 0) {
    handValue -= 10;
    aceCount -= 1;
  }

  return handValue;
}

/**
 * gets a string representation of given cards
 * @param {[{string,string}]} cards array of tuples representing cards
 * @return {string} a printable string representation of the given array of card representations
 */
function toString(cards) {
  return cards.reduce((accum, { suit, rank }) => {
    const RED = '\x1b[31m';
    const RESET = '\x1b[0m';

    const coloredCard = suit === '♦' || suit === '♥' ? `${RED}${rank}${suit}${RESET}` : `${rank}${suit}`;
    return `${accum}${coloredCard} `;
  }, '');
}

/**
 * Generates a string showing the cards in the hand and the value of the hand
 * @param {[{string, string}]} hand array of tuples representing a hand of cards
 * @param {boolean} hideFirst decides if the first card of the hand should be hidden
 * @return {string} the cards and point value of the hand
 */
function getHandDisplay(hand, hideFirst = false) {
  if (hideFirst) {
    return `?? ${toString(hand.slice(1, hand.length))}\nValue: ? + ${getHandValue(hand.slice(1, hand.length))}\n`;
  }
  return `${toString(hand)}\nValue: ${getHandValue(hand)}\n`;
}
