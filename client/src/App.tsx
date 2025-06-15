import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthWrapper } from "@/components/auth-wrapper";
import { SubscriptionGate } from "@/components/subscription-gate";
import { ThemeSelector } from "@/components/theme-selector";
import { EnvelopeAnimation } from "@/components/envelope-animation";
import { DadQuestionnaire, DadInfo } from "@/components/dad-questionnaire";
import { PersonalizedCard } from "@/components/personalized-card";
import { GiftReveal } from "@/components/gift-reveal";
import ArcadeDashboard from "@/pages/arcade-dashboard";
import NotFound from "@/pages/not-found";
import { User } from "@supabase/supabase-js";

type AppStage = 'theme-selection' | 'envelope' | 'questionnaire' | 'card' | 'gift-reveal' | 'arcade';

function Router() {
  return (
    <Switch>
      <Route path="/" component={ArcadeDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp({ user }: { user: User }) {
  const [currentStage, setCurrentStage] = useState<AppStage>('theme-selection');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [dadInfo, setDadInfo] = useState<DadInfo | null>(null);

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
    setCurrentStage('card');
  };

  const handleCardComplete = () => {
    setCurrentStage('gift-reveal');
  };

  const handleGiftRevealComplete = () => {
    setCurrentStage('arcade');
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'theme-selection':
        return <ThemeSelector onThemeSelect={handleThemeSelect} />;
      
      case 'envelope':
        return <EnvelopeAnimation onComplete={handleEnvelopeComplete} />;
      
      case 'questionnaire':
        return (
          <SubscriptionGate user={user} feature="card_generation">
            <DadQuestionnaire onComplete={handleQuestionnaireComplete} />
          </SubscriptionGate>
        );
      
      case 'card':
        return dadInfo ? (
          <PersonalizedCard dadInfo={dadInfo} onOpenGift={handleCardComplete} />
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-foreground">Loading...</div>
          </div>
        );
      
      case 'gift-reveal':
        return <GiftReveal onComplete={handleGiftRevealComplete} />;
      
      case 'arcade':
        return (
          <SubscriptionGate user={user} feature="unlimited_games">
            <Router />
          </SubscriptionGate>
        );
      
      default:
        return <Router />;
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
