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
  signature: string;
  dadAvatar: string; // SVG string
  cardTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export function AnimatedFatherCard({ dadInfo, onCardComplete }: AnimatedFatherCardProps) {
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
        setGeneratedCard(generateFallbackCard(dadInfo));
      }
    } catch (error) {
      setGeneratedCard(generateFallbackCard(dadInfo));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackCard = (info: DadInfo): GeneratedCard => {
    const themes = {
      funny: { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4', accentColor: '#45B7D1' },
      serious: { primaryColor: '#2C3E50', secondaryColor: '#3498DB', accentColor: '#E74C3C' },
      adventurous: { primaryColor: '#E67E22', secondaryColor: '#27AE60', accentColor: '#F39C12' },
      gentle: { primaryColor: '#8E44AD', secondaryColor: '#16A085', accentColor: '#E91E63' }
    };

    const dadName = info.name === 'Dad' ? 'Dad' : info.name;
    const dadAvatar = generateDadAvatar(info);
    
    return {
      frontMessage: 'Happy Father\'s Day!',
      insideMessage: `${dadName}, your ${info.personality} spirit and love for ${info.favoriteHobby} always brightens our days. Your ${info.specialTrait} makes you truly one-of-a-kind, and moments like ${info.favoriteMemory} remind me how lucky we are to have you. Thank you for being an amazing father!`,
      signature: 'Love, Kevin',
      dadAvatar,
      cardTheme: themes[info.personality]
    };
  };

  const generateDadAvatar = (info: DadInfo): string => {
    return `
      <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" style="stop-color:#FFE4B5"/>
            <stop offset="100%" style="stop-color:#DEB887"/>
          </radialGradient>
        </defs>
        
        <!-- Face -->
        <circle cx="100" cy="100" r="75" fill="url(#faceGradient)" stroke="#8B4513" stroke-width="2"/>
        
        <!-- Eyes -->
        <circle cx="80" cy="85" r="6" fill="#333"/>
        <circle cx="120" cy="85" r="6" fill="#333"/>
        <circle cx="82" cy="83" r="2" fill="#FFF"/>
        <circle cx="122" cy="83" r="2" fill="#FFF"/>
        
        <!-- Nose -->
        <ellipse cx="100" cy="100" rx="3" ry="5" fill="#CD853F"/>
        
        <!-- Mouth -->
        <path d="M 85 115 Q 100 125 115 115" stroke="#8B4513" stroke-width="2" fill="none" stroke-linecap="round"/>
        
        <!-- Hair -->
        <path d="M 40 60 Q 100 30 160 60 Q 150 45 100 35 Q 50 45 40 60" fill="#8B4513"/>
        
        <!-- Glasses (if serious personality) -->
        ${info.personality === 'serious' ? `
          <circle cx="80" cy="85" r="15" fill="none" stroke="#333" stroke-width="2"/>
          <circle cx="120" cy="85" r="15" fill="none" stroke="#333" stroke-width="2"/>
          <line x1="95" y1="85" x2="105" y2="85" stroke="#333" stroke-width="2"/>
        ` : ''}
        
        <!-- Beard (if adventurous) -->
        ${info.personality === 'adventurous' ? `
          <path d="M 70 130 Q 100 145 130 130 Q 125 140 100 142 Q 75 140 70 130" fill="#654321"/>
        ` : ''}
      </svg>
    `;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Creating Your Personalized Card</h2>
          <p className="text-lg text-gray-600">Adding special touches for {dadInfo.name === 'Dad' ? 'Dad' : dadInfo.name}...</p>
        </motion.div>
      </div>
    );
  }

  if (!generatedCard) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl w-full"
      >
        {/* Open-Style Father's Day Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4" style={{ borderColor: generatedCard.cardTheme.primaryColor }}>
          <div className="flex min-h-[500px]">
            {/* Left side - Image/Avatar */}
            <div 
              className="w-1/2 p-8 flex items-center justify-center relative"
              style={{ 
                background: `linear-gradient(135deg, ${generatedCard.cardTheme.primaryColor}, ${generatedCard.cardTheme.secondaryColor})` 
              }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-6"
                >
                  <div 
                    className="w-48 h-48 mx-auto rounded-full bg-white p-4 shadow-lg"
                    dangerouslySetInnerHTML={{ __html: generatedCard.dadAvatar }}
                  />
                </motion.div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                  {generatedCard.frontMessage}
                </h1>
                <div className="text-6xl text-white/80">
                  💙
                </div>
              </div>
            </div>
            
            {/* Right side - Message */}
            <div className="w-1/2 p-8 flex flex-col justify-between bg-white">
              <div className="flex-1 flex items-center">
                <div className="text-gray-800 text-lg leading-relaxed font-medium break-words">
                  {generatedCard.insideMessage}
                </div>
              </div>
              
              {/* Signature */}
              <div className="border-t-2 pt-6 mt-6" style={{ borderColor: generatedCard.cardTheme.accentColor }}>
                <div className="text-right">
                  <p className="text-2xl font-bold mb-2" style={{ color: generatedCard.cardTheme.primaryColor }}>
                    Love,
                  </p>
                  <p className="text-3xl font-bold" style={{ color: generatedCard.cardTheme.accentColor }}>
                    Kevin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Button
            onClick={onCardComplete}
            className="bg-gradient-to-r from-golden-yellow to-arcade-orange hover:from-golden-yellow/90 hover:to-arcade-orange/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue to Premium Unlock
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}