import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EnvelopeAnimationProps {
  onComplete: () => void;
  dadName: string;
}

export function EnvelopeAnimation({ onComplete, dadName }: EnvelopeAnimationProps) {
  const [stage, setStage] = useState<'sealed' | 'opening' | 'opened'>('sealed');

  const handleEnvelopeClick = () => {
    if (stage === 'sealed') {
      setStage('opening');
      setTimeout(() => {
        setStage('opened');
        setTimeout(onComplete, 1000);
      }, 2000);
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
          You've Got Mail!
        </motion.h1>
        
        <motion.div
          className="relative cursor-pointer mx-auto w-64 h-48"
          onClick={handleEnvelopeClick}
          whileHover={{ scale: stage === 'sealed' ? 1.05 : 1 }}
          whileTap={{ scale: stage === 'sealed' ? 0.95 : 1 }}
        >
          {/* Envelope Base */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 rounded-lg flex items-center justify-center" // Added flex centering
            initial={{ rotateY: 0 }}
            animate={{ 
              rotateY: stage === 'opened' ? 15 : 0,
              scale: stage === 'opened' ? 1.1 : 1
            }}
            transition={{ duration: 1 }}
          >
            {stage === 'sealed' && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <div className="text-amber-700 font-serif italic text-xl transform -rotate-3">To:</div>
                <div className="text-amber-800 font-serif italic text-3xl font-semibold transform -rotate-3">{dadName}</div>
              </motion.div>
            )}
          </motion.div>
          
          {/* Envelope Flap */}
          <motion.div
            className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-amber-200 to-amber-300 border-2 border-amber-400 rounded-t-lg origin-bottom"
            initial={{ rotateX: 0 }}
            animate={{ 
              rotateX: stage === 'opening' || stage === 'opened' ? -180 : 0,
              zIndex: stage === 'opened' ? -1 : 1
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{ transformStyle: 'preserve-3d' }}
          />
          
          {/* Card peeking out */}
          {stage === 'opened' && (
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 w-48 h-32 bg-gradient-to-br from-white to-gray-100 border border-gray-300 rounded shadow-lg"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: -20, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="p-4 text-center">
                <div className="text-4xl mb-2">💌</div>
                <div className="text-sm text-gray-600 font-semibold">Father's Day Card</div>
              </div>
            </motion.div>
          )}
          
          {/* Heart particles */}
          {stage === 'opened' && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-red-500 text-xl"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 20}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 0],
                    y: [0, -30, -60]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: 1 + i * 0.2,
                    ease: "easeOut"
                  }}
                >
                  ❤️
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
        
        {stage === 'sealed' && (
          <motion.p 
            className="text-muted-foreground mt-6 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Click to open your special Father's Day surprise!
          </motion.p>
        )}
        
        {stage === 'opening' && (
          <motion.p 
            className="text-primary mt-6 text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Opening your card...
          </motion.p>
        )}
        
        {stage === 'opened' && (
          <motion.p 
            className="text-primary mt-6 text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Loading your personalized message...
          </motion.p>
        )}
      </div>
    </div>
  );
}