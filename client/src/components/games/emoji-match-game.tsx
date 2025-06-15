import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmojiMatchGameProps {
  onGameEnd: (score: number) => void;
}

const EMOJIS = ['😀', '😎', '🤔', '😴', '🤗', '😂', '🥳', '😊', '🤩', '😋'];
const GRID_SIZE = 5;

export function EmojiMatchGame({ onGameEnd }: EmojiMatchGameProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetEmoji, setTargetEmoji] = useState<string>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const initializeGame = () => {
    const newGrid: string[][] = [];
    const target = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setTargetEmoji(target);

    // Create 5x5 grid with random emojis, ensuring target appears multiple times
    for (let i = 0; i < GRID_SIZE; i++) {
      const row: string[] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        if (Math.random() < 0.3) {
          row.push(target); // 30% chance for target emoji
        } else {
          row.push(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
        }
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!gameActive) return;

    const clickedEmoji = grid[rowIndex][colIndex];
    if (clickedEmoji === targetEmoji) {
      setScore(score + 10);
      // Remove the clicked emoji by replacing with empty space
      const newGrid = [...grid];
      newGrid[rowIndex][colIndex] = '';
      setGrid(newGrid);

      // Check if all target emojis are cleared
      const remainingTargets = newGrid.flat().filter(emoji => emoji === targetEmoji).length;
      if (remainingTargets === 0) {
        // Generate new round
        setTimeout(() => {
          initializeGame();
          setScore(score + 50); // Bonus for clearing all
        }, 500);
      }
    } else if (clickedEmoji !== '') {
      // Wrong emoji clicked, lose points
      setScore(Math.max(0, score - 5));
    }
  };

  const endGame = () => {
    setGameActive(false);
    onGameEnd(score);
  };

  return (
    <div className="text-center space-y-6">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Find: <span className="text-4xl">{targetEmoji}</span>
        </div>
        <div className="text-lg">
          Score: <span className="text-primary font-bold">{score}</span>
        </div>
        <div className="text-lg">
          Time: <span className="text-orange-500 font-bold">{timeLeft}s</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
        {grid.map((row, rowIndex) =>
          row.map((emoji, colIndex) => (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              className={`w-12 h-12 text-2xl border-2 rounded-lg transition-all ${
                emoji === '' 
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-card border-border hover:bg-accent'
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={!gameActive || emoji === ''}
              whileHover={{ scale: gameActive && emoji !== '' ? 1.1 : 1 }}
              whileTap={{ scale: gameActive && emoji !== '' ? 0.9 : 1 }}
              animate={{ 
                scale: emoji === '' ? [1, 1.2, 1] : 1,
                backgroundColor: emoji === targetEmoji ? ['#ffffff', '#22c55e', '#ffffff'] : '#ffffff'
              }}
              transition={{ duration: 0.3 }}
            >
              {emoji}
            </motion.button>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground max-w-md mx-auto">
        Click on all {targetEmoji} emojis to clear them! Each correct click gives +10 points, 
        wrong clicks give -5 points. Clear all target emojis for a +50 bonus!
      </div>

      {/* End Game Button */}
      {gameActive && (
        <Button onClick={endGame} variant="outline">
          End Game
        </Button>
      )}
    </div>
  );
}