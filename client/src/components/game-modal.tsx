import { useEffect } from 'react';

interface GameModalProps {
  isOpen: boolean;
  gameTitle: string;
  currentScore: number;
  gameTime: string;
  onClose: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export function GameModal({
  isOpen,
  gameTitle,
  currentScore,
  gameTime,
  onClose,
  onPause,
  onRestart
}: GameModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
      <div className="bg-dark-slate rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-neon-teal">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal">
          <h3 className="font-arcade text-lg text-neon-teal">{gameTitle}</h3>
          <button 
            className="text-gray-400 hover:text-white text-xl"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Game Content Area */}
        <div className="p-6 h-96 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <i className="fas fa-gamepad text-6xl text-neon-teal mb-4 animate-neon-glow"></i>
            <h4 className="font-arcade text-xl text-arcade-orange mb-4">{gameTitle}</h4>
            <p className="text-gray-300 mb-6">Game implementation will be loaded here</p>
            <button className="arcade-btn bg-arcade-orange hover:bg-arcade-orange/80 px-6 py-3 rounded-xl text-white font-arcade">
              COMING SOON
            </button>
          </div>
        </div>
        
        {/* Game Controls */}
        <div className="p-4 border-t border-charcoal bg-charcoal/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400">Score: <span className="text-golden-yellow font-arcade">{currentScore}</span></span>
              <span className="text-gray-400">Time: <span className="text-neon-teal font-arcade">{gameTime}</span></span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="arcade-btn bg-father-blue hover:bg-father-blue/80 px-4 py-2 rounded text-sm"
                onClick={onPause}
              >
                <i className="fas fa-pause mr-1"></i>Pause
              </button>
              <button 
                className="arcade-btn bg-arcade-orange hover:bg-arcade-orange/80 px-4 py-2 rounded text-sm"
                onClick={onRestart}
              >
                <i className="fas fa-redo mr-1"></i>Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
