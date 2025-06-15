import { useEffect, useState } from 'react';
import { EmojiMatchGame } from './games/emoji-match-game';
import { MemoryGame } from './games/memory-game';
import { TriviaGame } from './games/trivia-game';
import { CatchBallGame } from './games/catch-ball-game';
import { supabase } from '@/lib/supabase';

interface GameModalProps {
  isOpen: boolean;
  gameTitle: string;
  gameId: string;
  onClose: () => void;
  userId?: string;
}

export function GameModal({
  isOpen,
  gameTitle,
  gameId,
  onClose,
  userId
}: GameModalProps) {
  const [currentScore, setCurrentScore] = useState(0);
  const [gameStartTime] = useState(Date.now());

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleGameEnd = async (finalScore: number) => {
    setCurrentScore(finalScore);
    
    // Save game session to Supabase
    if (userId) {
      try {
        const duration = Math.floor((Date.now() - gameStartTime) / 1000);
        await supabase.from('game_sessions').insert({
          user_id: userId,
          game_type: gameId as 'emoji-match' | 'emoji-memory' | 'trivia' | 'catch-ball',
          score: finalScore,
          duration_seconds: duration,
          completed: true
        });

        // Update user stats
        await supabase.rpc('increment_user_stats', {
          user_id: userId,
          games_played_increment: 1,
          score_increment: finalScore
        });
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }

    // Close modal after showing score briefly
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const renderGame = () => {
    switch (gameId) {
      case 'emoji-match':
        return <EmojiMatchGame onGameEnd={handleGameEnd} />;
      case 'emoji-memory':
        return <MemoryGame onGameEnd={handleGameEnd} />;
      case 'trivia':
        return <TriviaGame onGameEnd={handleGameEnd} />;
      case 'catch-ball':
        return <CatchBallGame onGameEnd={handleGameEnd} />;
      default:
        return (
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">🎮</div>
            <h4 className="text-xl mb-4">{gameTitle}</h4>
            <p className="mb-6">Game not implemented yet</p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto border border-border">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-arcade text-lg text-foreground">{gameTitle}</h3>
          <button 
            className="text-muted-foreground hover:text-foreground text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        {/* Game Content Area */}
        <div className="p-6 min-h-[400px]">
          {renderGame()}
        </div>
      </div>
    </div>
  );
}
