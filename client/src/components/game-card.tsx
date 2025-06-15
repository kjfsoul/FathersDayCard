interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: string;
  difficultyColor: string;
  buttonColor: string;
  borderColor: string;
  hoverBorderColor: string;
  highScore: number;
  animationDelay?: string;
  onGameSelect: (gameId: string) => void;
}

export function GameCard({
  id,
  title,
  description,
  icon,
  duration,
  difficulty,
  difficultyColor,
  buttonColor,
  borderColor,
  hoverBorderColor,
  highScore,
  animationDelay = "0s",
  onGameSelect
}: GameCardProps) {
  return (
    <div 
      className={`game-card bg-gradient-to-br from-charcoal to-dark-slate rounded-2xl p-6 border-2 ${borderColor} ${hoverBorderColor} cursor-pointer`}
      onClick={() => onGameSelect(id)}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = '';
      }}
    >
      <div className="text-center">
        <div className="mb-4">
          <i 
            className={`${icon} text-5xl mb-3 animate-float`}
            style={{ animationDelay }}
          ></i>
          <h3 className={`font-arcade text-lg mb-2 ${title.includes('MATCH') ? 'text-neon-teal' : title.includes('MEMORY') ? 'text-father-blue' : title.includes('TRIVIA') ? 'text-mint-green' : 'text-retro-purple'}`}>
            {title}
          </h3>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex justify-between items-center mb-4 text-xs">
          <span className="bg-mint-green/20 text-mint-green px-2 py-1 rounded">
            <i className="fas fa-clock mr-1"></i>{duration}
          </span>
          <span className={`${difficultyColor} px-2 py-1 rounded`}>
            <i className="fas fa-star mr-1"></i>{difficulty}
          </span>
        </div>
        
        <button 
          className={`arcade-btn w-full ${buttonColor} text-white font-arcade text-sm py-3 rounded-xl transition-all`}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <i className="fas fa-play mr-2"></i>START GAME
        </button>
        
        <div className="mt-3 text-xs text-gray-400">
          Best: <span className="text-golden-yellow font-arcade">{highScore}</span> pts
        </div>
      </div>
    </div>
  );
}
