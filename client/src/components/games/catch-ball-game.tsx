import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';

interface CatchBallGameProps {
  onGameEnd: (score: number) => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  emoji: string;
}

const BALL_EMOJIS = ['⚽', '🏀', '⚾', '🎾', '🏈', '🏐'];
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 80; // Increased paddle width slightly
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 10;

export function CatchBallGame({ onGameEnd }: CatchBallGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const paddleRef = useRef<Matter.Body | null>(null);
  const ballSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [level, setLevel] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Matter.js
    const engine = Matter.Engine.create();
    engineRef.current = engine;
    engine.gravity.y = 0.5 + (level - 1) * 0.1; // Gravity increases with level

    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        wireframes: false, // Show solid shapes
        background: 'transparent', // Use canvas CSS for background
      }
    });
    renderRef.current = render;

    // Create paddle
    const paddle = Matter.Bodies.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 30,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      {
        isStatic: true, // Kinematic bodies are better controlled by setPosition
        label: 'paddle',
        chamfer: { radius: 5 }
      }
    );
    paddleRef.current = paddle;

    // Create boundaries
    const ground = Matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT, CANVAS_WIDTH, 20, { isStatic: true, label: 'ground' });
    const leftWall = Matter.Bodies.rectangle(0, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, { isStatic: true, label: 'wall-left' });
    const rightWall = Matter.Bodies.rectangle(CANVAS_WIDTH, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, { isStatic: true, label: 'wall-right' });
    // Top wall to prevent balls from bouncing off screen if spawned too high with velocity
    const topWall = Matter.Bodies.rectangle(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH, 20, {isStatic: true, label: 'wall-top'});


    Matter.World.add(engine.world, [paddle, ground, leftWall, rightWall, topWall]);

    // Run the renderer
    Matter.Render.run(render);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // Collision handling
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        const isBallA = bodyA.label === 'ball';
        const isBallB = bodyB.label === 'ball';

        if (isBallA || isBallB) {
          const ballBody = isBallA ? bodyA : bodyB;
          const otherBody = isBallA ? bodyB : bodyA;

          if (otherBody.label === 'paddle') {
            setScore(prev => prev + 10);
            triggerParticleBurst(ballBody.position.x, ballBody.position.y, (ballBody as any).emoji || '💥');
            Matter.World.remove(engine.world, ballBody);
          } else if (otherBody.label === 'ground') {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameActive(false);
                // onGameEnd will be called via useEffect [gameActive]
              }
              return newLives;
            });
            Matter.World.remove(engine.world, ballBody);
          }
        }
      });
    });

    // Cleanup
    return () => {
      if (ballSpawnIntervalRef.current) clearInterval(ballSpawnIntervalRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (renderRef.current) Matter.Render.stop(renderRef.current);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
      // Remove canvas and other elements if Matter.js doesn't clean them up fully.
      // renderRef.current.canvas.remove(); // Example, may need adjustment
      // renderRef.current.textures = {};
    };
  }, []); // Run once on mount

  // Game active state management
  useEffect(() => {
    if (!gameActive && lives <= 0) {
      if (ballSpawnIntervalRef.current) clearInterval(ballSpawnIntervalRef.current);
      // Stop engine updates if needed, or just prevent new balls
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current); // Stop physics simulation
      setTimeout(() => onGameEnd(score), 100);
    } else if (gameActive) {
      if (runnerRef.current && !runnerRef.current.enabled) { // Restart runner if game becomes active again (e.g. after reset)
          Matter.Runner.run(runnerRef.current, engineRef.current!);
      }
      startBallSpawning();
    }
    return () => {
      if (ballSpawnIntervalRef.current) clearInterval(ballSpawnIntervalRef.current);
    };
  }, [gameActive, lives, score, onGameEnd]);

  // Level and ball spawning
  useEffect(() => {
    if (gameActive) {
      startBallSpawning();
      if (engineRef.current) {
        engineRef.current.gravity.y = 0.5 + (level - 1) * 0.05; // Adjust gravity slightly
      }
    }
  }, [level, gameActive]);

  const startBallSpawning = () => {
    if (ballSpawnIntervalRef.current) clearInterval(ballSpawnIntervalRef.current);
    ballSpawnIntervalRef.current = setInterval(() => {
      if (gameActive && engineRef.current) {
        spawnBall(engineRef.current);
      }
    }, Math.max(1500 - level * 150, 400)); // Adjusted spawn rate
  }

  const spawnBall = (engine: Matter.Engine) => {
    const randomEmoji = BALL_EMOJIS[Math.floor(Math.random() * BALL_EMOJIS.length)];
    const ball = Matter.Bodies.circle(
      Math.random() * (CANVAS_WIDTH - BALL_RADIUS * 2) + BALL_RADIUS,
      BALL_RADIUS + 20, // Spawn near top, below top wall
      BALL_RADIUS,
      {
        label: 'ball',
        restitution: 0.5, // Bounciness
        friction: 0.1,
        render: {
          // Using sprite for emoji rendering if possible with Matter.Render
          // This is a basic attempt; direct DOM overlay might be more reliable for complex sprites/text
           sprite: {
             // texture: 'path/to/emoji.png', // Needs actual image path or data URI
             // For now, let's just use a color and try to overlay emoji via DOM if this fails
           },
          fillStyle: '#FF8C00' // Default color if sprite doesn't work
        },
        // Custom properties
        id: Date.now(), // Matter.js Body has its own id, but we can add ours
        emoji: randomEmoji, // Store emoji for particle burst or other logic
      }
    );
    Matter.Body.setVelocity(ball, { x: (Math.random() - 0.5) * 2, y: 2 + level * 0.2 });
    Matter.World.add(engine.world, ball);
  };

  const triggerParticleBurst = (x: number, y: number, emoji: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x,
        y,
        emoji: Math.random() > 0.5 ? '✨' : emoji, // Mix of sparkles and ball emoji
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    // Auto-remove particles after animation
    newParticles.forEach(p => {
      setTimeout(() => {
        setParticles(currentParticles => currentParticles.filter(particle => particle.id !== p.id));
      }, 1000); // Particle visible for 1 second
    });
  };

  // Update paddle position
  const handleUserMovement = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !paddleRef.current || !engineRef.current || !gameActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const newPaddleX = Math.max(
      PADDLE_WIDTH / 2,
      Math.min(x, CANVAS_WIDTH - PADDLE_WIDTH / 2)
    );
    Matter.Body.setPosition(paddleRef.current, { x: newPaddleX, y: paddleRef.current.position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleUserMovement(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    if (e.touches[0]) {
      handleUserMovement(e.touches[0].clientX);
    }
  };

  // Reset game logic
  const resetGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setParticles([]); // Clear particles

    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false); // Clear bodies, keep static
      // Re-add paddle and walls as they might be cleared if not static or if full clear is used
      const paddle = Matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30, PADDLE_WIDTH, PADDLE_HEIGHT, { isStatic: true, label: 'paddle', chamfer: { radius: 5 } });
      paddleRef.current = paddle;
      const ground = Matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT, CANVAS_WIDTH, 20, { isStatic: true, label: 'ground' });
      const leftWall = Matter.Bodies.rectangle(0, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, { isStatic: true, label: 'wall-left' });
      const rightWall = Matter.Bodies.rectangle(CANVAS_WIDTH, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, { isStatic: true, label: 'wall-right' });
      const topWall = Matter.Bodies.rectangle(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH, 20, {isStatic: true, label: 'wall-top'});
      Matter.World.add(engineRef.current.world, [paddle, ground, leftWall, rightWall, topWall]);
      engineRef.current.gravity.y = 0.5; // Reset gravity
    }
    setGameActive(true); // This will trigger useEffect to restart runner and ball spawning
  };

  // Update level based on score
  useEffect(() => {
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
    }
  }, [score, level]);


  return (
    <div className="text-center space-y-4">
      {/* Game Header */}
      <div className="flex justify-between items-center text-sm">
        <div>Score: <span className="text-primary font-bold">{score}</span></div>
        <div>Level: <span className="text-orange-500 font-bold">{level}</span></div>
        <div>Lives: <span className="text-red-500 font-bold">{'❤️'.repeat(lives)}</span></div>
      </div>

      {/* Game Canvas and Particle Overlay */}
      <div className="relative mx-auto" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <canvas
          ref={canvasRef}
          // width and height are set by Matter.Render options
          className="border-2 border-border rounded-lg bg-gradient-to-b from-sky-200 to-green-200 cursor-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          style={{ touchAction: 'none' }} // Important for touch devices
        />
        
        {/* Particle Effects Overlay */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute text-lg pointer-events-none"
              initial={{ x: p.x, y: p.y, opacity: 1, scale: 0.5 }}
              animate={{
                x: p.x + (Math.random() - 0.5) * 60, // Spread out
                y: p.y + (Math.random() - 0.5) * 60, // Spread out
                opacity: 0,
                scale: Math.random() * 0.5 + 0.5
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ transform: 'translate(-50%, -50%)' }} // Center emoji
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Game Over Overlay */}
        {!gameActive && lives <= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg"
          >
            <div className="bg-card p-6 rounded-lg text-center shadow-xl">
              <h3 className="text-2xl font-bold text-foreground mb-3">Game Over!</h3>
              <p className="text-muted-foreground mb-5">Final Score: {score}</p>
              <Button onClick={resetGame} size="lg">Play Again</Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground max-w-sm mx-auto">
        Move your mouse or finger to control the paddle. Catch falling balls!
        Speed and gravity increase each level.
      </div>

      {/* Game Controls */}
      <div className="space-x-3">
        {gameActive && (
          <Button onClick={() => { setGameActive(false); onGameEnd(score); }} variant="outline" size="sm">
            End Game
          </Button>
        )}
        <Button onClick={resetGame} variant="destructive" size="sm">
          Reset
        </Button>
      </div>
    </div>
  );
}