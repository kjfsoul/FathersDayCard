import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GiftRevealProps {
  onComplete: () => void;
}

export function GiftReveal({ onComplete }: GiftRevealProps) {
  const [stage, setStage] = useState<'wrapped' | 'unwrapping' | 'revealed'>('wrapped');

  const handleGiftClick = () => {
    if (stage === 'wrapped') {
      setStage('unwrapping');
      setTimeout(() => {
        setStage('revealed');
        setTimeout(onComplete, 2000);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <motion.h1 
          className="font-arcade text-2xl md:text-4xl text-foreground mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Your Special Gift Awaits!
        </motion.h1>
        
        <motion.div
          className="relative cursor-pointer mx-auto w-80 h-80"
          onClick={handleGiftClick}
          whileHover={{ scale: stage === 'wrapped' ? 1.05 : 1 }}
          whileTap={{ scale: stage === 'wrapped' ? 0.95 : 1 }}
        >
          {/* Gift Box Base */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 border-4 border-red-700 rounded-2xl shadow-2xl"
            initial={{ rotateY: 0 }}
            animate={{ 
              rotateY: stage === 'revealed' ? 180 : 0,
              scale: stage === 'revealed' ? 0.8 : 1,
              opacity: stage === 'revealed' ? 0 : 1
            }}
            transition={{ duration: 2 }}
          />
          
          {/* Gift Ribbon - Vertical */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-full bg-gradient-to-b from-yellow-400 to-yellow-500 border-2 border-yellow-600"
            initial={{ scaleY: 1 }}
            animate={{ 
              scaleY: stage === 'unwrapping' || stage === 'revealed' ? 0 : 1,
              opacity: stage === 'revealed' ? 0 : 1
            }}
            transition={{ duration: 1.5, delay: stage === 'unwrapping' ? 0.5 : 0 }}
          />
          
          {/* Gift Ribbon - Horizontal */}
          <motion.div
            className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 border-2 border-yellow-600"
            initial={{ scaleX: 1 }}
            animate={{ 
              scaleX: stage === 'unwrapping' || stage === 'revealed' ? 0 : 1,
              opacity: stage === 'revealed' ? 0 : 1
            }}
            transition={{ duration: 1.5, delay: stage === 'unwrapping' ? 0.8 : 0 }}
          />
          
          {/* Gift Bow */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
            initial={{ scale: 1, rotate: 0 }}
            animate={{ 
              scale: stage === 'unwrapping' ? [1, 1.5, 0] : stage === 'revealed' ? 0 : 1,
              rotate: stage === 'unwrapping' ? [0, 180, 360] : 0,
              opacity: stage === 'revealed' ? 0 : 1
            }}
            transition={{ duration: 2, delay: stage === 'unwrapping' ? 1 : 0 }}
          >
            🎀
          </motion.div>
          
          {/* Arcade Content Revealed */}
          {stage === 'revealed' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl border-4 border-purple-400 shadow-2xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎮
              </motion.div>
              <h3 className="font-arcade text-xl text-white mb-2">ARCADE</h3>
              <h4 className="font-arcade text-lg text-yellow-300">GAMES</h4>
              
              {/* Game icons floating around */}
              {['🎯', '🧠', '❓', '⚾'].map((icon, i) => (
                <motion.div
                  key={i}
                  className="absolute text-3xl"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${25 + (i % 2) * 50}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1,
                    y: [0, -20, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: 1.5 + i * 0.3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {icon}
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Sparkle effects */}
          {stage === 'unwrapping' && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400 text-2xl"
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: `${10 + Math.floor(i / 4) * 25}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: 0.5 + i * 0.1,
                    ease: "easeOut"
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
        
        {stage === 'wrapped' && (
          <motion.p 
            className="text-muted-foreground mt-6 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Click to unwrap your gift!
          </motion.p>
        )}
        
        {stage === 'unwrapping' && (
          <motion.p 
            className="text-primary mt-6 text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Unwrapping your surprise...
          </motion.p>
        )}
        
        {stage === 'revealed' && (
          <motion.p 
            className="text-primary mt-6 text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Welcome to your personal arcade!
          </motion.p>
        )}
      </div>
    </div>
  );
}