import { useState } from 'react';
import { ArcadeHeader } from '@/components/arcade-header';
import { GameCard } from '@/components/game-card';
import { GameModal } from '@/components/game-modal';
import { StatsSection } from '@/components/stats-section';
import { PrivacyNotice } from '@/components/privacy-notice';
import { ShareCard } from '@/components/share-card';
import { Button } from '@/components/ui/button';
import { Heart, Mail } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface ArcadeDashboardProps {
  user?: User;
  onThankYouCard?: () => void;
}

export default function ArcadeDashboard({ user, onThankYouCard }: ArcadeDashboardProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Game state
  const highScores = {
    emojiMatch: 1250,
    memory: 890,
    trivia: 1450,
    catch: 2150
  };

  const totalStats = {
    gamesPlayed: 42,
    totalScore: 8750,
    winStreak: 7,
    timeSpent: '2.5h'
  };

  const games = [
    {
      id: 'emoji-match',
      title: 'EMOJI MATCH',
      description: 'Match pairs of emojis in this classic memory game. Quick reflexes and sharp memory required!',
      icon: 'fas fa-smile text-golden-yellow',
      duration: '2-5 min',
      difficulty: 'Easy',
      difficultyColor: 'bg-retro-purple/20 text-retro-purple',
      buttonColor: 'bg-arcade-orange hover:bg-arcade-orange/80',
      borderColor: 'border-neon-teal/30',
      hoverBorderColor: 'hover:border-neon-teal',
      highScore: highScores.emojiMatch,
      animationDelay: '0s'
    },
    {
      id: 'emoji-memory',
      title: 'MEMORY MASTER',
      description: 'Watch the sequence, then repeat it perfectly. How many rounds can you remember?',
      icon: 'fas fa-brain text-retro-purple',
      duration: '3-8 min',
      difficulty: 'Medium',
      difficultyColor: 'bg-arcade-orange/20 text-arcade-orange',
      buttonColor: 'bg-father-blue hover:bg-father-blue/80',
      borderColor: 'border-father-blue/30',
      hoverBorderColor: 'hover:border-father-blue',
      highScore: highScores.memory,
      animationDelay: '0.3s'
    },
    {
      id: 'trivia',
      title: 'DAD TRIVIA',
      description: 'Test your knowledge with dad jokes, sports, and classic trivia questions!',
      icon: 'fas fa-question-circle text-mint-green',
      duration: '5-10 min',
      difficulty: 'Easy',
      difficultyColor: 'bg-retro-purple/20 text-retro-purple',
      buttonColor: 'bg-mint-green hover:bg-mint-green/80 text-dark-slate',
      borderColor: 'border-mint-green/30',
      hoverBorderColor: 'hover:border-mint-green',
      highScore: highScores.trivia,
      animationDelay: '0.6s'
    },
    {
      id: 'catch-ball',
      title: 'CATCH MASTER',
      description: 'Catch falling objects with your basket. Speed increases as you score more points!',
      icon: 'fas fa-baseball-ball text-arcade-orange',
      duration: '2-6 min',
      difficulty: 'Hard',
      difficultyColor: 'bg-neon-teal/20 text-neon-teal',
      buttonColor: 'bg-retro-purple hover:bg-retro-purple/80',
      borderColor: 'border-retro-purple/30',
      hoverBorderColor: 'hover:border-retro-purple',
      highScore: highScores.catch,
      animationDelay: '0.9s'
    }
  ];

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
  };

  const getGameTitle = (gameId: string | null) => {
    if (!gameId) return '';
    const game = games.find(g => g.id === gameId);
    return game?.title || '';
  };

  const highestScore = Math.max(...Object.values(highScores));

  return (
    <div className="bg-gradient-to-br from-dark-slate to-charcoal min-h-screen text-white retro-grid">
      <ArcadeHeader 
        highScore={highestScore}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8 animate-pixel-fade">
            <h2 className="font-arcade text-2xl md:text-4xl text-arcade-orange mb-4 animate-neon-glow">
              FATHER'S DAY
            </h2>
            <h3 className="font-arcade text-lg md:text-2xl text-neon-teal mb-6">
              ARCADE CHALLENGE
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              Show Dad your gaming skills! Four epic arcade games await. 
              Collect points, beat high scores, and prove you're the ultimate arcade champion!
            </p>
          </div>
          
          {/* Dad-themed decorative elements */}
          <div className="flex justify-center space-x-8 text-4xl mb-8 opacity-60">
            <i className="fas fa-mustache text-arcade-orange animate-float" style={{animationDelay: '0.5s'}}></i>
            <i className="fas fa-glasses text-father-blue animate-float" style={{animationDelay: '1s'}}></i>
            <i className="fas fa-hat-cowboy text-mint-green animate-float" style={{animationDelay: '1.5s'}}></i>
          </div>
        </div>
      </section>

      {/* Game Selection */}
      <main className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {games.map(game => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              duration={game.duration}
              difficulty={game.difficulty}
              difficultyColor={game.difficultyColor}
              buttonColor={game.buttonColor}
              borderColor={game.borderColor}
              hoverBorderColor={game.hoverBorderColor}
              highScore={game.highScore}
              animationDelay={game.animationDelay}
              onGameSelect={handleGameSelect}
            />
          ))}
        </div>

        <StatsSection
          totalGamesPlayed={totalStats.gamesPlayed}
          totalScore={totalStats.totalScore}
          winStreak={totalStats.winStreak}
          timeSpent={totalStats.timeSpent}
        />

        {/* Action Buttons Section */}
        <div className="mt-12 space-y-6 max-w-md mx-auto">
          {/* Thank You Card Button */}
          {onThankYouCard && (
            <div className="text-center">
              <Button
                onClick={onThankYouCard}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Heart className="w-5 h-5 mr-2" />
                Send Dad a Thank You Card
              </Button>
              <p className="text-gray-400 text-sm mt-2">
                Let Dad know how much you appreciate him!
              </p>
            </div>
          )}

          {/* Share Section */}
          <ShareCard 
            cardTitle="Father's Day Arcade"
            dadName="Dad"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-slate/50 border-t border-neon-teal/30 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-4 text-2xl">
            <i className="fas fa-heart text-arcade-orange animate-float"></i>
            <i className="fas fa-gamepad text-neon-teal animate-float" style={{animationDelay: '0.5s'}}></i>
            <i className="fas fa-trophy text-golden-yellow animate-float" style={{animationDelay: '1s'}}></i>
          </div>
          
          <p className="text-gray-400 text-sm mb-2">
            Made with <i className="fas fa-heart text-red-500"></i> for the best dad ever!
          </p>
          
          <p className="font-arcade text-xs text-neon-teal mb-3">
            HAPPY FATHER'S DAY 2025
          </p>
          
          <div className="flex justify-center">
            <PrivacyNotice />
          </div>
        </div>
      </footer>

      <GameModal
        isOpen={selectedGame !== null}
        gameTitle={getGameTitle(selectedGame)}
        gameId={selectedGame || ''}
        onClose={handleCloseGame}
        userId={user?.id}
      />
    </div>
  );
}
