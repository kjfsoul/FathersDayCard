import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CatchBallGameProps {
  onGameEnd: (score: number) => void;
}

interface Ball {
  id: number;
  x: number;
  y: number;
  speed: number;
  emoji: string;
}

const BALL_EMOJIS = ['⚽', '🏀', '⚾', '🎾', '🏈', '🏐'];

export function CatchBallGame({ onGameEnd }: CatchBallGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [paddleX, setPaddleX] = useState(200);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [level, setLevel] = useState(1);
  const gameLoopRef = useRef<number>();

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 300;
  const PADDLE_WIDTH = 60;
  const PADDLE_HEIGHT = 10;

  useEffect(() => {
    if (gameActive) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
      };
    }
  }, [gameActive, balls, paddleX]);

  useEffect(() => {
    // Spawn new balls periodically
    if (gameActive) {
      const interval = setInterval(() => {
        spawnBall();
      }, Math.max(1000 - level * 100, 300));
      
      return () => clearInterval(interval);
    }
  }, [gameActive, level]);

  const spawnBall = () => {
    const newBall: Ball = {
      id: Date.now(),
      x: Math.random() * (CANVAS_WIDTH - 30),
      y: -20,
      speed: 2 + level * 0.5,
      emoji: BALL_EMOJIS[Math.floor(Math.random() * BALL_EMOJIS.length)]
    };
    setBalls(prev => [...prev, newBall]);
  };

  const gameLoop = () => {
    setBalls(prevBalls => {
      const updatedBalls = prevBalls.map(ball => ({
        ...ball,
        y: ball.y + ball.speed
      }));

      // Check collisions with paddle
      const survivingBalls = updatedBalls.filter(ball => {
        const ballBottom = ball.y + 20;
        const ballLeft = ball.x;
        const ballRight = ball.x + 20;
        const paddleTop = CANVAS_HEIGHT - 20;
        const paddleLeft = paddleX;
        const paddleRight = paddleX + PADDLE_WIDTH;

        // Check if ball hits paddle
        if (ballBottom >= paddleTop && ballBottom <= paddleTop + PADDLE_HEIGHT &&
            ballRight >= paddleLeft && ballLeft <= paddleRight) {
          setScore(prev => prev + 10);
          return false; // Remove ball
        }

        // Check if ball missed (fell off screen)
        if (ball.y > CANVAS_HEIGHT) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameActive(false);
              setTimeout(() => onGameEnd(score), 100);
            }
            return newLives;
          });
          return false; // Remove ball
        }

        return true; // Keep ball
      });

      return survivingBalls;
    });

    // Increase level based on score
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
    }

    if (gameActive) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(x - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(x - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH)));
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setBalls([]);
    setGameActive(true);
    setPaddleX(200);
  };

  return (
    <div className="text-center space-y-4">
      {/* Game Header */}
      <div className="flex justify-between items-center text-sm">
        <div>Score: <span className="text-primary font-bold">{score}</span></div>
        <div>Level: <span className="text-orange-500 font-bold">{level}</span></div>
        <div>Lives: <span className="text-red-500 font-bold">{'❤️'.repeat(lives)}</span></div>
      </div>

      {/* Game Canvas */}
      <div className="relative mx-auto" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-border rounded-lg bg-gradient-to-b from-blue-100 to-green-100 cursor-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          style={{ touchAction: 'none' }}
        />
        
        {/* Render balls */}
        {balls.map(ball => (
          <div
            key={ball.id}
            className="absolute text-xl pointer-events-none"
            style={{
              left: ball.x,
              top: ball.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {ball.emoji}
          </div>
        ))}

        {/* Render paddle */}
        <div
          className="absolute bg-primary rounded-full"
          style={{
            left: paddleX,
            top: CANVAS_HEIGHT - 20,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
          }}
        />

        {/* Game Over Overlay */}
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"
          >
            <div className="bg-card p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Game Over!</h3>
              <p className="text-muted-foreground mb-4">Final Score: {score}</p>
              <Button onClick={resetGame}>Play Again</Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground max-w-sm mx-auto">
        Move your mouse or finger to control the paddle. Catch falling balls to score points!
        Miss 3 balls and it's game over. Speed increases each level.
      </div>

      {/* Game Controls */}
      <div className="space-x-3">
        {gameActive && (
          <Button onClick={() => onGameEnd(score)} variant="outline" size="sm">
            End Game
          </Button>
        )}
        <Button onClick={resetGame} variant="outline" size="sm">
          Reset
        </Button>
      </div>
    </div>
  );
}