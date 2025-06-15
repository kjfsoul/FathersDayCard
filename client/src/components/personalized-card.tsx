import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { DadInfo } from './dad-questionnaire';
import { ShareCard } from './share-card';

interface PersonalizedCardProps {
  dadInfo: DadInfo;
  onOpenGift: () => void;
}

interface CardContent {
  title: string;
  message: string;
  animation: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function PersonalizedCard({ dadInfo, onOpenGift }: PersonalizedCardProps) {
  const [cardContent, setCardContent] = useState<CardContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateCard();
  }, [dadInfo]);

  const generateCard = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadInfo),
      });

      if (response.ok) {
        const content = await response.json();
        setCardContent(content);
      } else {
        // Fallback card generation
        setCardContent(generateFallbackCard(dadInfo));
      }
    } catch (error) {
      // Fallback card generation
      setCardContent(generateFallbackCard(dadInfo));
    }
    
    setIsGenerating(false);
  };

  const generateFallbackCard = (info: DadInfo): CardContent => {
    const personalityCards = {
      funny: {
        title: `Happy Father's Day, ${info.name}!`,
        message: `You're the dad with all the best jokes and the biggest heart! Your love for ${info.favoriteHobby} and your amazing sense of humor make every day brighter. ${info.favoriteMemory} is just one of the countless memories that show what an incredible father you are. ${info.specialTrait} - that's what makes you one of a kind!`,
        animation: '🎭',
        colors: { primary: '#FF6B35', secondary: '#F7931E', accent: '#FFD23F' }
      },
      serious: {
        title: `To the Wisest Dad, ${info.name}`,
        message: `Your thoughtful guidance and wisdom have shaped who I am today. Whether you're enjoying ${info.favoriteHobby} or sharing life lessons, you always know the right thing to say. ${info.favoriteMemory} reminds me of your incredible strength and love. ${info.specialTrait} - these qualities make you an extraordinary father.`,
        animation: '🦉',
        colors: { primary: '#2C5F41', secondary: '#4A7C59', accent: '#8FB996' }
      },
      adventurous: {
        title: `Adventure Awaits, ${info.name}!`,
        message: `From your passion for ${info.favoriteHobby} to all our amazing adventures together, you've taught me to embrace life fully! ${info.favoriteMemory} is proof of your adventurous spirit and loving heart. ${info.specialTrait} - you're not just a dad, you're a true life explorer!`,
        animation: '🏔️',
        colors: { primary: '#1B4D3E', secondary: '#2E7D6B', accent: '#4ECDC4' }
      },
      gentle: {
        title: `With Love for ${info.name}`,
        message: `Your gentle heart and caring nature make you the most wonderful dad. Whether you're enjoying ${info.favoriteHobby} or just being there when I need you most, your love shines through. ${info.favoriteMemory} captures the essence of your beautiful soul. ${info.specialTrait} - you are truly a gift to our family.`,
        animation: '💝',
        colors: { primary: '#8E7CC3', secondary: '#A18CD4', accent: '#C8B2DB' }
      }
    };

    return personalityCards[info.personality];
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ✨
          </motion.div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Creating Your Personal Card...
          </h2>
          <p className="text-muted-foreground">
            Making something special for {dadInfo.name}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!cardContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Unable to Generate Card
          </h2>
          <Button onClick={generateCard}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="max-w-lg w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Card Container */}
        <motion.div
          className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-200"
          style={{ 
            background: `linear-gradient(135deg, ${cardContent.colors.primary}20, ${cardContent.colors.secondary}20)`,
            borderColor: cardContent.colors.accent 
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-4xl">{cardContent.animation}</div>
            <div className="absolute top-4 right-4 text-4xl">{cardContent.animation}</div>
            <div className="absolute bottom-4 left-4 text-4xl">{cardContent.animation}</div>
            <div className="absolute bottom-4 right-4 text-4xl">{cardContent.animation}</div>
          </div>

          {/* Card Content */}
          <div className="relative p-8 text-center">
            {/* Animated Icon */}
            <motion.div
              className="text-8xl mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
            >
              {cardContent.animation}
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-3xl font-bold mb-6 text-gray-800"
              style={{ color: cardContent.colors.primary }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {cardContent.title}
            </motion.h1>

            {/* Message */}
            <motion.p
              className="text-lg leading-relaxed text-gray-700 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {cardContent.message}
            </motion.p>

            {/* Hearts Animation */}
            <motion.div
              className="flex justify-center space-x-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ 
                    delay: 1.6 + i * 0.1,
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                >
                  ❤️
                </motion.span>
              ))}
            </motion.div>

            {/* Share Card Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="mb-6"
            >
              <ShareCard 
                cardTitle="Father's Day Card"
                dadName={dadInfo.name}
              />
            </motion.div>

            {/* Open Gift Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <Button
                onClick={onOpenGift}
                size="lg"
                className="text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ 
                  backgroundColor: cardContent.colors.primary,
                  borderColor: cardContent.colors.accent
                }}
              >
                🎮 Open Your Arcade Gift!
              </Button>
            </motion.div>

            {/* Signature */}
            <motion.p
              className="text-sm text-gray-500 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.3 }}
            >
              Made with love for the best dad ever! 💝
            </motion.p>
          </div>

          {/* Floating decorative elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl opacity-20"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                color: cardContent.colors.accent
              }}
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}