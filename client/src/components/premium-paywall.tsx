import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Star, Crown, Gamepad2, Heart, Sparkles, Gift } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PremiumPaywallProps {
  user: User;
  onUpgrade: () => void;
  onSkip: () => void;
  showRandomGame?: boolean;
  dadName?: string;
}

export function PremiumPaywall({ user, onUpgrade, onSkip, showRandomGame = false, dadName = "Dad" }: PremiumPaywallProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await apiRequest('POST', '/api/upgrade/premium', { userId: user.id });
      toast({
        title: "Welcome to Premium!",
        description: "You now have unlimited access to all features.",
      });
      onUpgrade();
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const randomGames = [
    { name: "Emoji Match", icon: "🎯", demo: "Quick memory challenge!" },
    { name: "Trivia Game", icon: "🧠", demo: "Test your knowledge!" },
    { name: "Catch Ball", icon: "⚾", demo: "Catch the falling objects!" },
    { name: "Memory Game", icon: "🃏", demo: "Match the card pairs!" }
  ];

  const selectedGame = randomGames[Math.floor(Math.random() * randomGames.length)];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-lg bg-white shadow-2xl border-2 border-blue-300">
        <CardHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-golden-yellow to-arcade-orange rounded-full flex items-center justify-center"
          >
            <Crown className="w-8 h-8 text-white" />
          </motion.div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Unlock the Full {dadName} Experience!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              You've created an amazing card for {dadName}! Ready for more fun?
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Premium Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-golden-yellow" />
              Premium Features ($9.99)
            </h3>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-800">Unlimited personalized cards</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <Gamepad2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-800">Access to all 4 arcade games</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <Gift className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-800">Premium themes & animations</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <Star className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-800">Advanced sharing features</span>
              </div>
            </div>
          </div>

          {/* Random Game Preview */}
          {showRandomGame && (
            <div className="p-4 bg-gradient-to-r from-neon-teal/10 to-retro-purple/10 rounded-lg border border-neon-teal/20">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-2xl">{selectedGame.icon}</span>
                Try {selectedGame.name}!
              </h4>
              <p className="text-sm text-gray-600 mb-3">{selectedGame.demo}</p>
              <Badge variant="outline" className="text-xs">
                Preview available after upgrade
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-gradient-to-r from-golden-yellow to-arcade-orange hover:from-golden-yellow/90 hover:to-arcade-orange/90 text-white font-semibold py-3"
            >
              {isUpgrading ? 'Processing...' : 'Upgrade to Premium - $9.99'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onSkip}
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            One-time purchase • Secure checkout • Instant access
          </p>
          
          <p className="text-xs text-blue-600 text-center mt-2">
            Testing? Access games directly at: <a href="/games" className="underline font-medium">/games</a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}