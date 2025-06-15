interface StatsSectionProps {
  totalGamesPlayed: number;
  totalScore: number;
  winStreak: number;
  timeSpent: string;
}

export function StatsSection({
  totalGamesPlayed,
  totalScore,
  winStreak,
  timeSpent
}: StatsSectionProps) {
  return (
    <section className="mt-12 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-dark-slate to-charcoal rounded-2xl p-6 border border-neon-teal/30">
        <h3 className="font-arcade text-center text-neon-teal mb-6 text-lg">ARCADE STATS</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-charcoal/50 rounded-lg p-4">
            <div className="text-2xl font-arcade text-arcade-orange mb-1">{totalGamesPlayed}</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>
          
          <div className="bg-charcoal/50 rounded-lg p-4">
            <div className="text-2xl font-arcade text-golden-yellow mb-1">{totalScore}</div>
            <div className="text-xs text-gray-400">Total Score</div>
          </div>
          
          <div className="bg-charcoal/50 rounded-lg p-4">
            <div className="text-2xl font-arcade text-mint-green mb-1">{winStreak}</div>
            <div className="text-xs text-gray-400">Win Streak</div>
          </div>
          
          <div className="bg-charcoal/50 rounded-lg p-4">
            <div className="text-2xl font-arcade text-father-blue mb-1">{timeSpent}</div>
            <div className="text-xs text-gray-400">Time Played</div>
          </div>
        </div>
      </div>
    </section>
  );
}
