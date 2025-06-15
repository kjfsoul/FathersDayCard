import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MemoryGameProps {
  onGameEnd: (score: number) => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🎮', '🎯', '🏆', '⭐', '🎨', '🎪'];

export function MemoryGame({ onGameEnd }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(card => card.id === first);
      const secondCard = cards.find(card => card.id === second);
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          setScore(score + 100);
          setFlippedCards([]);
          
          // Check for game completion
          const updatedCards = cards.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          );
          if (updatedCards.every(card => card.isMatched)) {
            setGameWon(true);
            setTimeout(() => onGameEnd(score + 100), 1000);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(moves + 1);
    }
  }, [flippedCards, cards, score, moves]);

  const initializeGame = () => {
    // Create pairs of cards
    const gameEmojis = [...EMOJIS, ...EMOJIS];
    const shuffledEmojis = shuffleArray(gameEmojis);
    
    const initialCards: Card[] = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(initialCards);
    setScore(1000); // Start with 1000 points, lose points for incorrect moves
    setMoves(0);
    setFlippedCards([]);
    setGameWon(false);
  };

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || gameWon) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => [...prev, cardId]);
  };

  const calculateFinalScore = () => {
    const baseScore = score;
    const moveBonus = Math.max(0, 100 - moves * 5); // Bonus for fewer moves
    return baseScore + moveBonus;
  };

  return (
    <div className="text-center space-y-6">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div className="text-lg">
          Moves: <span className="font-bold">{moves}</span>
        </div>
        <div className="text-lg">
          Score: <span className="text-primary font-bold">{score}</span>
        </div>
        {gameWon && (
          <div className="text-lg text-green-600 font-bold">You Won! 🎉</div>
        )}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="aspect-square cursor-pointer"
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: !card.isFlipped && !card.isMatched ? 1.05 : 1 }}
            whileTap={{ scale: !card.isFlipped && !card.isMatched ? 0.95 : 1 }}
          >
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card Back */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary to-primary/80 rounded-lg border-2 border-primary/30 flex items-center justify-center">
                <div className="text-2xl">❓</div>
              </div>
              
              {/* Card Front */}
              <div 
                className={`absolute inset-0 backface-hidden bg-card border-2 rounded-lg flex items-center justify-center ${
                  card.isMatched ? 'border-green-500 bg-green-100' : 'border-border'
                }`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="text-3xl">{card.emoji}</div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground max-w-md mx-auto">
        Find matching pairs by flipping two cards at a time. 
        Match all pairs to win! Fewer moves = higher score.
      </div>

      {/* Game Controls */}
      <div className="space-x-3">
        <Button onClick={initializeGame} variant="outline">
          New Game
        </Button>
        <Button onClick={() => onGameEnd(calculateFinalScore())} variant="outline">
          End Game
        </Button>
      </div>

      {gameWon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 border border-green-300 rounded-lg p-4 text-green-800"
        >
          Congratulations! You won with {moves} moves!
          <br />
          Final Score: {calculateFinalScore()}
        </motion.div>
      )}
    </div>
  );
}