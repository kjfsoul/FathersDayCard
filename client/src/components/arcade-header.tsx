import { useState } from 'react';

interface ArcadeHeaderProps {
  highScore: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function ArcadeHeader({ highScore, soundEnabled, onToggleSound }: ArcadeHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-dark-slate/90 backdrop-blur-sm border-b-2 border-neon-teal">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <i className="fas fa-gamepad text-2xl text-arcade-orange animate-float"></i>
            <h1 className="font-arcade text-lg md:text-xl text-neon-teal tracking-wider">DAD'S ARCADE</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* High Score Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-charcoal/50 px-3 py-2 rounded-lg border border-golden-yellow">
              <i className="fas fa-trophy text-golden-yellow"></i>
              <span className="font-arcade text-xs text-golden-yellow">{highScore}</span>
            </div>
            
            {/* Sound Toggle */}
            <button 
              className="arcade-btn bg-father-blue hover:bg-father-blue/80 px-3 py-2 rounded-lg"
              onClick={onToggleSound}
            >
              <i className={`fas ${soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'} text-white`}></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
