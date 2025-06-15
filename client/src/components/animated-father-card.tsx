import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DadInfo } from './dad-questionnaire';

interface AnimatedFatherCardProps {
  dadInfo: DadInfo;
  onCardComplete: () => void;
}

interface GeneratedCard {
  frontMessage: string;
  insideMessage: string;
  dadAvatar: string; // SVG string
  cardTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    pattern: string;
  };
}

export function AnimatedFatherCard({ dadInfo, onCardComplete }: AnimatedFatherCardProps) {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateCard();
  }, [dadInfo]);

  const generateCard = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-animated-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadInfo),
      });

      if (response.ok) {
        const card = await response.json();
        setGeneratedCard(card);
      } else {
        // Fallback card generation
        setGeneratedCard(generateFallbackCard(dadInfo));
      }
    } catch (error) {
      setGeneratedCard(generateFallbackCard(dadInfo));
    }
    
    setIsGenerating(false);
  };

  const generateFallbackCard = (info: DadInfo): GeneratedCard => {
    const themes = {
      funny: { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4', accentColor: '#45B7D1', pattern: 'polka-dots' },
      serious: { primaryColor: '#2C3E50', secondaryColor: '#3498DB', accentColor: '#E74C3C', pattern: 'stripes' },
      adventurous: { primaryColor: '#E67E22', secondaryColor: '#27AE60', accentColor: '#F39C12', pattern: 'zigzag' },
      gentle: { primaryColor: '#8E44AD', secondaryColor: '#16A085', accentColor: '#E91E63', pattern: 'hearts' }
    };

    // Generate simple SVG avatar based on dad info
    const dadAvatar = generateDadAvatar(info);
    
    return {
      frontMessage: `Happy Father's Day, ${info.name}!`,
      insideMessage: `Dear ${info.name}, your love for ${info.favoriteHobby} and your ${info.personality} spirit make you the best dad ever! Remember ${info.favoriteMemory}? That's just one of many amazing moments. Your ${info.specialTrait} always brightens our day!`,
      dadAvatar,
      cardTheme: themes[info.personality]
    };
  };

  const generateDadAvatar = (info: DadInfo): string => {
    // Generate simple cartoon SVG based on personality and traits
    const baseAvatar = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" style="stop-color:#FFE4B5"/>
            <stop offset="100%" style="stop-color:#DEB887"/>
          </radialGradient>
        </defs>
        
        <!-- Face -->
        <circle cx="100" cy="100" r="80" fill="url(#faceGradient)" stroke="#8B4513" stroke-width="2"/>
        
        <!-- Eyes -->
        <circle cx="80" cy="85" r="8" fill="#000"/>
        <circle cx="120" cy="85" r="8" fill="#000"/>
        <circle cx="82" cy="83" r="3" fill="#FFF"/>
        <circle cx="122" cy="83" r="3" fill="#FFF"/>
        
        <!-- Nose -->
        <ellipse cx="100" cy="100" rx="4" ry="6" fill="#CD853F"/>
        
        <!-- Mouth -->
        <path d="M 85 115 Q 100 130 115 115" stroke="#8B4513" stroke-width="3" fill="none" stroke-linecap="round"/>
        
        <!-- Personality-based features -->
        ${getPersonalityFeatures(info.personality)}
        
        <!-- Hobby-based accessories -->
        ${getHobbyAccessories(info.favoriteHobby)}
      </svg>
    `;
    
    return baseAvatar;
  };

  const getPersonalityFeatures = (personality: string): string => {
    switch (personality) {
      case 'funny':
        return `
          <!-- Funny mustache and eyebrows -->
          <path d="M 75 105 Q 85 110 95 105 Q 105 110 115 105 Q 125 110 135 105" stroke="#8B4513" stroke-width="4" fill="none"/>
          <path d="M 70 75 Q 80 70 90 75" stroke="#8B4513" stroke-width="3" fill="none"/>
          <path d="M 110 75 Q 120 70 130 75" stroke="#8B4513" stroke-width="3" fill="none"/>
        `;
      case 'serious':
        return `
          <!-- Serious glasses and beard -->
          <rect x="65" y="80" width="30" height="20" fill="none" stroke="#000" stroke-width="2" rx="5"/>
          <rect x="105" y="80" width="30" height="20" fill="none" stroke="#000" stroke-width="2" rx="5"/>
          <line x1="95" y1="90" x2="105" y2="90" stroke="#000" stroke-width="2"/>
          <path d="M 80 130 Q 100 140 120 130" stroke="#8B4513" stroke-width="6" fill="#8B4513"/>
        `;
      case 'adventurous':
        return `
          <!-- Adventure hat -->
          <ellipse cx="100" cy="50" rx="60" ry="15" fill="#D2691E"/>
          <ellipse cx="100" cy="45" rx="55" ry="20" fill="#8B4513"/>
          <circle cx="100" cy="45" r="5" fill="#FFD700"/>
        `;
      case 'gentle':
        return `
          <!-- Gentle smile and kind eyes -->
          <path d="M 75 80 Q 80 75 85 80" stroke="#8B4513" stroke-width="2" fill="none"/>
          <path d="M 115 80 Q 120 75 125 80" stroke="#8B4513" stroke-width="2" fill="none"/>
          <path d="M 85 115 Q 100 125 115 115" stroke="#FF69B4" stroke-width="3" fill="none"/>
        `;
      default:
        return '';
    }
  };

  const getHobbyAccessories = (hobby: string): string => {
    if (hobby.toLowerCase().includes('sport') || hobby.toLowerCase().includes('football') || hobby.toLowerCase().includes('baseball')) {
      return `<circle cx="150" cy="60" r="12" fill="#8B4513" stroke="#000" stroke-width="1"/>`;
    } else if (hobby.toLowerCase().includes('music') || hobby.toLowerCase().includes('guitar')) {
      return `<path d="M 140 50 L 160 50 L 160 80 L 140 80 Z" fill="#8B4513" stroke="#000"/>`;
    } else if (hobby.toLowerCase().includes('cook') || hobby.toLowerCase().includes('grill')) {
      return `<rect x="140" y="45" width="20" height="5" fill="#D3D3D3" stroke="#000"/>`;
    }
    return '';
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🎨
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Dad's Avatar...</h2>
          <p className="text-lg opacity-80">Making something special for {dadInfo.name}</p>
        </motion.div>
      </div>
    );
  }

  if (!generatedCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Unable to Generate Card</h2>
          <Button onClick={generateCard} className="bg-white text-red-900">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Floating hearts animation */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl text-red-400 opacity-60"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 50,
            scale: 0
          }}
          animate={{ 
            y: -50, 
            scale: [0, 1, 0],
            rotate: 360
          }}
          transition={{ 
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        >
          ❤️
        </motion.div>
      ))}

      <div className="relative" style={{ perspective: "1000px" }}>
        <motion.div
          className="w-96 h-80 cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isCardOpen ? 180 : 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          onClick={() => !isCardOpen && setIsCardOpen(true)}
        >
          {/* Card Front */}
          <motion.div
            className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${generatedCard.cardTheme.primaryColor}, ${generatedCard.cardTheme.secondaryColor})`,
              backfaceVisibility: "hidden"
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-8 text-center relative">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-20">
                {generatedCard.cardTheme.pattern === 'hearts' && (
                  <>
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-4xl"
                        style={{
                          left: `${20 + (i % 4) * 25}%`,
                          top: `${20 + Math.floor(i / 4) * 25}%`,
                        }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      >
                        💝
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              <motion.h1
                className="text-4xl font-bold text-white mb-4 drop-shadow-lg z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Happy
              </motion.h1>
              
              <motion.div
                className="text-6xl mb-4 z-10"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                👨‍👧‍👦
              </motion.div>
              
              <motion.h1
                className="text-4xl font-bold text-white drop-shadow-lg z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                Father's Day!
              </motion.h1>

              {!isCardOpen && (
                <motion.p
                  className="text-lg text-white/80 mt-4 z-10"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Click to open
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Card Inside */}
          <motion.div
            className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden bg-white"
            style={{ 
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="h-full p-6 flex flex-col items-center justify-center text-center">
              {/* Generated Dad Avatar */}
              <motion.div
                className="mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
                dangerouslySetInnerHTML={{ __html: generatedCard.dadAvatar }}
              />

              <motion.p
                className="text-lg text-gray-800 leading-relaxed mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                {generatedCard.insideMessage}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <Button
                  onClick={onCardComplete}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
                >
                  Continue to Gift! 🎁
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}