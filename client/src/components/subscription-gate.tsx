import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface SubscriptionGateProps {
  user: User;
  feature: 'card_generation' | 'unlimited_games' | 'premium_themes';
  children: React.ReactNode;
}

interface UserData {
  subscription_status: 'free' | 'active' | 'canceled' | 'past_due';
  cards_generated: number;
  games_played: number;
}

const LIMITS = {
  free: {
    cards_per_month: 3,
    games_per_day: 20
  }
};

export function SubscriptionGate({ user, feature, children }: SubscriptionGateProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, cards_generated, games_played')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user data:', error);
        return;
      }

      if (!data) {
        // Create user record if it doesn't exist
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email!,
            subscription_status: 'free',
            cards_generated: 0,
            games_played: 0
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user:', insertError);
          return;
        }
        setUserData(newUser);
      } else {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          priceId: 'price_monthly_premium', // You'll need to create this in Stripe
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  // Check if user has access to the feature
  const hasAccess = () => {
    if (!userData) return false;
    
    if (userData.subscription_status === 'active') return true;
    
    // Check free tier limits
    if (feature === 'card_generation') {
      return userData.cards_generated < LIMITS.free.cards_per_month;
    }
    
    if (feature === 'unlimited_games') {
      return userData.games_played < LIMITS.free.games_per_day;
    }
    
    return false;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  // Show upgrade prompt
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground mb-2">
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              {feature === 'card_generation' && 
                `You've created ${userData?.cards_generated}/${LIMITS.free.cards_per_month} free cards this month.`
              }
              {feature === 'unlimited_games' && 
                `You've played ${userData?.games_played}/${LIMITS.free.games_per_day} free games today.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Premium Benefits */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Premium Benefits:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">✨</Badge>
                    <span className="text-sm">Unlimited personalized cards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">🎮</Badge>
                    <span className="text-sm">Unlimited game plays</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">🎨</Badge>
                    <span className="text-sm">Premium themes and customization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">📊</Badge>
                    <span className="text-sm">Advanced analytics and stats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">💾</Badge>
                    <span className="text-sm">Save and share multiple cards</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">$4.99</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                  <div className="text-xs text-muted-foreground mt-1">Cancel anytime</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleUpgrade}
                  className="w-full"
                  size="lg"
                >
                  Upgrade to Premium
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}