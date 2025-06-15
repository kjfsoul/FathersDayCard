import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthWrapper } from "@/components/auth-wrapper";
import { ThemeSelector } from "@/components/theme-selector";
import { PremiumPaywall } from "@/components/premium-paywall";
import { EnvelopeAnimation } from "@/components/envelope-animation";
import { DadQuestionnaire, DadInfo } from "@/components/dad-questionnaire";
import { PersonalizedCard } from "@/components/personalized-card";
import { AnimatedFatherCard } from "@/components/animated-father-card";
import { GiftReveal } from "@/components/gift-reveal";
import { ArcadeIntroPersonalizer, ArcadeIntroData } from "@/components/arcade-intro-personalizer";
import { ThankYouCardCreator } from "@/components/thank-you-card-creator";
import ArcadeDashboard from "@/pages/arcade-dashboard";
import NotFound from "@/pages/not-found";
import { User } from "@supabase/supabase-js";

type AppStage = 'theme-selection' | 'envelope' | 'questionnaire' | 'animated-card' | 'gift-reveal' | 'arcade-personalizer' | 'arcade' | 'thank-you-card';

function Router({ user, onThankYouCard }: { user: User; onThankYouCard?: () => void }) {
  return (
    <Switch>
      <Route path="/" component={() => <ArcadeDashboard user={user} onThankYouCard={onThankYouCard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp({ user }: { user: User }) {
  const [currentStage, setCurrentStage] = useState<AppStage>('theme-selection');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [dadInfo, setDadInfo] = useState<DadInfo | null>(null);
  const [arcadeIntro, setArcadeIntro] = useState<ArcadeIntroData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (selectedTheme) {
      document.documentElement.className = selectedTheme;
    }
  }, [selectedTheme]);

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setCurrentStage('envelope');
  };

  const handleEnvelopeComplete = () => {
    setCurrentStage('questionnaire');
  };

  const handleQuestionnaireComplete = (info: DadInfo) => {
    setDadInfo(info);
    setCurrentStage('animated-card');
  };

  const handleAnimatedCardComplete = () => {
    // Show paywall after card preview
    setShowPaywall(true);
  };

  const handlePremiumUpgrade = () => {
    setIsPremium(true);
    setShowPaywall(false);
    setCurrentStage('gift-reveal');
  };

  const handlePaywallSkip = () => {
    setShowPaywall(false);
    setCurrentStage('gift-reveal');
  };

  const handleGiftRevealComplete = () => {
    setCurrentStage('arcade-personalizer');
  };

  const handleArcadePersonalizerComplete = (introData: ArcadeIntroData) => {
    setArcadeIntro(introData);
    setCurrentStage('arcade');
  };

  const handleThankYouCardComplete = () => {
    setCurrentStage('arcade');
  };

  const handleThankYouCardStart = () => {
    setCurrentStage('thank-you-card');
  };

  // Show paywall if activated after card preview
  if (showPaywall) {
    return (
      <PremiumPaywall
        user={user}
        onUpgrade={handlePremiumUpgrade}
        onSkip={handlePaywallSkip}
        showRandomGame={true}
        dadName={dadInfo?.name || "Dad"}
      />
    );
  }

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'theme-selection':
        return <ThemeSelector onThemeSelect={handleThemeSelect} />;
      
      case 'envelope':
        return <EnvelopeAnimation onComplete={handleEnvelopeComplete} />;
      
      case 'questionnaire':
        return <DadQuestionnaire onComplete={handleQuestionnaireComplete} />;
      
      case 'animated-card':
        return dadInfo ? (
          <AnimatedFatherCard dadInfo={dadInfo} onCardComplete={handleAnimatedCardComplete} />
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-foreground">Loading...</div>
          </div>
        );
      
      case 'gift-reveal':
        return <GiftReveal onComplete={handleGiftRevealComplete} />;
      
      case 'arcade-personalizer':
        return <ArcadeIntroPersonalizer onComplete={handleArcadePersonalizerComplete} />;
      
      case 'arcade':
        return <Router user={user} onThankYouCard={handleThankYouCardStart} />;
      
      case 'thank-you-card':
        return <ThankYouCardCreator onComplete={handleThankYouCardComplete} />;
      
      default:
        return <Router user={user} />;
    }
  };

  return renderCurrentStage();
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthWrapper>
          {(user) => <AuthenticatedApp user={user} />}
        </AuthWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
