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
    primary: string; // Updated to match OpenAI response key
    secondary: string; // Updated to match OpenAI response key
    accent: string; // Updated to match OpenAI response key
  };
  openAIEmoji?: string; // Optional: for the emoji from OpenAI
}

export function AnimatedFatherCard({ dadInfo, onCardComplete }: AnimatedFatherCardProps) {
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    generateCard();
  }, [dadInfo]);

  const generateCard = async () => {
    setIsGenerating(true);
    const localDadAvatar = generateDadAvatar(dadInfo); // Generate avatar locally

    try {
      const response = await fetch('/api/generate-card', { // Changed endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadInfo),
      });

      if (response.ok) {
        const openAICard = await response.json();
        // Combine OpenAI content with local avatar
        setGeneratedCard({
          frontMessage: openAICard.title, // Use title from OpenAI
          insideMessage: openAICard.message, // Use message from OpenAI
          dadAvatar: localDadAvatar, // Use locally generated avatar
          cardTheme: openAICard.colors, // Use colors from OpenAI
          signature: "Love, Your Favorite Child 😉", // Or keep as "Love, Kevin"
          openAIEmoji: openAICard.animation, // Store emoji
        });
      } else {
        // API error, use fallback but with local avatar
        setGeneratedCard(generateFallbackCard(dadInfo, localDadAvatar));
      }
    } catch (error) {
      // Network or other error, use fallback with local avatar
      setGeneratedCard(generateFallbackCard(dadInfo, localDadAvatar));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackCard = (info: DadInfo, avatar: string): GeneratedCard => {
    const themes = {
      funny: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#45B7D1' },
      serious: { primary: '#2C3E50', secondary: '#3498DB', accent: '#E74C3C' },
      adventurous: { primary: '#E67E22', secondary: '#27AE60', accent: '#F39C12' },
      gentle: { primary: '#8E44AD', secondary: '#16A085', accent: '#E91E63' }
    };
    
    // Fallback witty message incorporating dadInfo
    const hobby = info.favoriteHobby || "being awesome";
    const personalityTrait = info.personality || "unique";
    const fallbackMessage = `Hey ${info.name === 'Dad' ? 'Dad' : info.name}, even though our fancy AI is on a coffee break, we know you're incredible! Happy Father's Day to the coolest dad, master of ${hobby} and purveyor of fine ${personalityTrait} moments! You're the best (even if our robots are slacking)!`;

    return {
      frontMessage: 'Happy Father\'s Day!',
      insideMessage: fallbackMessage,
      signature: 'Love, Your Favorite Child 😉',
      dadAvatar: avatar, // Use provided avatar
      cardTheme: themes[info.personality] || themes.gentle,
      openAIEmoji: '🎉', // Default emoji for fallback
    };
  };

  // This function is now defined outside generateCard if it's called by both
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
        className="relative max-w-4xl w-full"
      >
        {/* 3D Flip Card Container */}
        <div className="relative w-full h-[500px]" style={{ perspective: '1000px' }}>
          <motion.div
            className="relative w-full h-full cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front of Card */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden border-4"
              style={{
                backfaceVisibility: 'hidden',
                background: `linear-gradient(135deg, ${generatedCard.cardTheme.primary}, ${generatedCard.cardTheme.secondary})`,
                borderColor: generatedCard.cardTheme.primary
              }}
            >
              <div className="h-full p-8 flex flex-col items-center justify-center text-center relative">
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
                <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-4">
                  {generatedCard.frontMessage}
                </h1>
                <div className="text-6xl text-white/80 mb-4">
                  💙
                </div>
                <p className="text-lg text-white/90">
                  Click to open your card
                </p>
              </div>
            </div>

            {/* Back of Card (Inside) */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden border-4 bg-white"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderColor: generatedCard.cardTheme.primary
              }}
            >
              <div className="h-full flex">
                {/* Left side - Avatar */}
                <div 
                  className="w-1/3 p-6 flex flex-col items-center justify-center"
                  style={{ 
                    background: `linear-gradient(180deg, ${generatedCard.cardTheme.secondary}, ${generatedCard.cardTheme.accent})`
                  }}
                >
                  <div
                    className="w-40 h-40 rounded-full bg-white p-2 shadow-md overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: generatedCard.dadAvatar }}
                  />
                  {generatedCard.openAIEmoji && (
                    <div className="mt-2 text-white text-3xl drop-shadow-md">{generatedCard.openAIEmoji}</div>
                  )}
                </div>
                
                {/* Right side - Message */}
                <div className="w-2/3 p-4 flex flex-col justify-between bg-white"> {/* Ensure message area has white background */}
                  <div className="flex-1 flex items-center justify-center"> {/* Centering text */}
                    <div className="text-gray-800 text-base leading-relaxed font-medium break-words hyphens-auto overflow-y-auto max-h-[300px] p-2 text-center"> {/* Added text-center and max-h */}
                      {generatedCard.insideMessage}
                    </div>
                  </div>
                  
                  {/* Signature */}
                  <div className="border-t-2 pt-3 mt-3" style={{ borderColor: generatedCard.cardTheme.accent }}>
                    <div className="text-right">
                      <p className="text-lg font-bold mb-1" style={{ color: generatedCard.cardTheme.primary }}>
                        {generatedCard.signature.split(',')[0]},
                      </p>
                      <p className="text-xl font-bold" style={{ color: generatedCard.cardTheme.accent }}>
                        {generatedCard.signature.split(',')[1]?.trim()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Button
            onClick={onCardComplete}
            className="bg-gradient-to-r from-golden-yellow to-arcade-orange hover:from-golden-yellow/90 hover:to-arcade-orange/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue to Premium Unlock
          </Button>
        </motion.div>

        {/* Current Prompt Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="mt-6 p-4 bg-white/80 rounded-lg text-xs text-gray-600"
        >
          <details>
            <summary className="cursor-pointer font-medium">Card Generation Details</summary>
            <div className="mt-2 space-y-1">
              <p><strong>System:</strong> OpenAI Powered Card (gpt-4o)</p>
              <p><strong>Dad Name:</strong> {dadInfo.name === 'Dad' ? 'Dad' : dadInfo.name}</p>
              <p><strong>Personality Input:</strong> {dadInfo.personality}</p>
              <p><strong>Hobby Input:</strong> {dadInfo.favoriteHobby}</p>
              <p><strong>Avatar:</strong> Locally generated SVG with personality features</p>
              <p><strong>Theme Colors:</strong> Primary: {generatedCard.cardTheme.primary}, Secondary: {generatedCard.cardTheme.secondary}, Accent: {generatedCard.cardTheme.accent}</p>
            </div>
          </details>
        </motion.div>
      </motion.div>
    </div>
  );
}