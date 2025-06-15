import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Send, Camera, Sparkles } from 'lucide-react';
import { ShareCard } from './share-card';

interface ThankYouCardCreatorProps {
  onComplete: () => void;
  childName?: string;
}

interface ThankYouCardData {
  dadName: string;
  personalMessage: string;
  favoriteMemory: string;
  cardStyle: 'heartfelt' | 'funny' | 'grateful' | 'proud';
  signatureName: string;
}

export function ThankYouCardCreator({ onComplete, childName = "Your Child" }: ThankYouCardCreatorProps) {
  const [cardData, setCardData] = useState<ThankYouCardData>({
    dadName: 'Dad',
    personalMessage: '',
    favoriteMemory: '',
    cardStyle: 'heartfelt',
    signatureName: childName
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const cardStyles = [
    { 
      value: 'heartfelt', 
      label: 'Heartfelt', 
      emoji: '💝', 
      description: 'Warm and sincere',
      colors: { primary: '#E91E63', secondary: '#F8BBD9', accent: '#AD1457' }
    },
    { 
      value: 'funny', 
      label: 'Funny', 
      emoji: '😄', 
      description: 'Light and humorous',
      colors: { primary: '#FF9800', secondary: '#FFE0B2', accent: '#F57C00' }
    },
    { 
      value: 'grateful', 
      label: 'Grateful', 
      emoji: '🙏', 
      description: 'Deep appreciation',
      colors: { primary: '#4CAF50', secondary: '#C8E6C9', accent: '#388E3C' }
    },
    { 
      value: 'proud', 
      label: 'Proud', 
      emoji: '🏆', 
      description: 'Celebrating achievements',
      colors: { primary: '#2196F3', secondary: '#BBDEFB', accent: '#1976D2' }
    }
  ];

  const generateThankYouCard = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-thank-you-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        const generated = await response.json();
        setGeneratedCard(generated);
      } else {
        // Generate fallback card
        const selectedStyle = cardStyles.find(s => s.value === cardData.cardStyle)!;
        setGeneratedCard({
          title: `Thank You, ${cardData.dadName}!`,
          message: cardData.personalMessage || `Dear ${cardData.dadName}, thank you for being the amazing father you are. Your love and support mean everything to me.`,
          memory: cardData.favoriteMemory,
          dadAvatar: generateThankYouAvatar(),
          colors: selectedStyle.colors,
          signature: cardData.signatureName
        });
      }
    } catch (error) {
      const selectedStyle = cardStyles.find(s => s.value === cardData.cardStyle)!;
      setGeneratedCard({
        title: `Thank You, ${cardData.dadName}!`,
        message: cardData.personalMessage || `Dear ${cardData.dadName}, thank you for being the amazing father you are.`,
        memory: cardData.favoriteMemory,
        dadAvatar: generateThankYouAvatar(),
        colors: selectedStyle.colors,
        signature: cardData.signatureName
      });
    }
    
    setIsGenerating(false);
    setShowPreview(true);
  };

  const generateThankYouAvatar = (): string => {
    return `
      <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="thankYouGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" style="stop-color:#FFD700"/>
            <stop offset="100%" style="stop-color:#FFA500"/>
          </radialGradient>
        </defs>
        
        <!-- Heart background -->
        <path d="M75 130 C60 115, 30 85, 30 60 C30 45, 45 30, 60 30 C67 30, 75 35, 75 35 C75 35, 83 30, 90 30 C105 30, 120 45, 120 60 C120 85, 90 115, 75 130 Z" fill="url(#thankYouGradient)" stroke="#FF6B6B" stroke-width="2"/>
        
        <!-- Thank you text -->
        <text x="75" y="60" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#8B0000">THANK</text>
        <text x="75" y="80" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#8B0000">YOU</text>
        
        <!-- Sparkles -->
        <circle cx="40" cy="45" r="3" fill="#FFD700"/>
        <circle cx="110" cy="45" r="3" fill="#FFD700"/>
        <circle cx="45" cy="100" r="2" fill="#FFD700"/>
        <circle cx="105" cy="100" r="2" fill="#FFD700"/>
        
        <!-- Small hearts -->
        <text x="25" y="35" font-size="12" fill="#FF69B4">💕</text>
        <text x="115" y="35" font-size="12" fill="#FF69B4">💕</text>
      </svg>
    `;
  };

  if (showPreview && generatedCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Card Header */}
          <div 
            className="h-32 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${generatedCard.colors.primary}, ${generatedCard.colors.secondary})` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                dangerouslySetInnerHTML={{ __html: generatedCard.dadAvatar }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            <motion.h1
              className="text-3xl font-bold text-center mb-6"
              style={{ color: generatedCard.colors.primary }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {generatedCard.title}
            </motion.h1>

            <motion.p
              className="text-gray-700 leading-relaxed mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {generatedCard.message}
            </motion.p>

            {generatedCard.memory && (
              <motion.div
                className="bg-gray-50 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <p className="text-sm text-gray-600 italic">
                  "Favorite memory: {generatedCard.memory}"
                </p>
              </motion.div>
            )}

            <motion.p
              className="text-right text-lg font-semibold mb-6"
              style={{ color: generatedCard.colors.accent }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              With love,<br />
              {generatedCard.signature} ❤️
            </motion.p>

            {/* Share Options */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
            >
              <ShareCard 
                cardTitle="Thank You Card"
                dadName={cardData.dadName}
              />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex-1"
              >
                Edit Card
              </Button>
              <Button
                onClick={onComplete}
                className="flex-1"
                style={{ backgroundColor: generatedCard.colors.primary }}
              >
                Complete
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💌
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Create a Thank You Card</h2>
          <p className="text-white/80">Send your appreciation back to Dad</p>
        </div>

        <div className="space-y-6">
          {/* Dad's Name */}
          <div>
            <Label htmlFor="dadName" className="text-white text-lg font-semibold">
              Dad's Name
            </Label>
            <Input
              id="dadName"
              value={cardData.dadName}
              onChange={(e) => setCardData(prev => ({ ...prev, dadName: e.target.value }))}
              placeholder="What do you call him?"
              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {/* Card Style */}
          <div>
            <Label className="text-white text-lg font-semibold mb-4 block">Card Style</Label>
            <div className="grid grid-cols-2 gap-3">
              {cardStyles.map((style) => (
                <motion.button
                  key={style.value}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    cardData.cardStyle === style.value
                      ? 'border-yellow-400 bg-yellow-400/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setCardData(prev => ({ ...prev, cardStyle: style.value as any }))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl mb-2">{style.emoji}</div>
                  <div className="text-white font-semibold">{style.label}</div>
                  <div className="text-white/60 text-sm">{style.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <Label htmlFor="personalMessage" className="text-white text-lg font-semibold">
              Your Message
            </Label>
            <Textarea
              id="personalMessage"
              value={cardData.personalMessage}
              onChange={(e) => setCardData(prev => ({ ...prev, personalMessage: e.target.value }))}
              placeholder="Write your heartfelt message to Dad..."
              rows={4}
              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
            />
          </div>

          {/* Favorite Memory */}
          <div>
            <Label htmlFor="favoriteMemory" className="text-white text-lg font-semibold">
              Favorite Memory (Optional)
            </Label>
            <Textarea
              id="favoriteMemory"
              value={cardData.favoriteMemory}
              onChange={(e) => setCardData(prev => ({ ...prev, favoriteMemory: e.target.value }))}
              placeholder="Share a special memory you have with Dad..."
              rows={3}
              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
            />
          </div>

          {/* Signature Name */}
          <div>
            <Label htmlFor="signatureName" className="text-white text-lg font-semibold">
              Sign the Card
            </Label>
            <Input
              id="signatureName"
              value={cardData.signatureName}
              onChange={(e) => setCardData(prev => ({ ...prev, signatureName: e.target.value }))}
              placeholder="How should you be signed?"
              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={generateThankYouCard}
              disabled={isGenerating || !cardData.dadName || !cardData.signatureName}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Creating Card...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Create Thank You Card
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}