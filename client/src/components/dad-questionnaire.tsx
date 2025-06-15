import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';

interface DadQuestionnaireProps {
  onComplete: (dadInfo: DadInfo) => void;
}

export interface DadInfo {
  name: string;
  favoriteHobby: string;
  personality: 'funny' | 'serious' | 'adventurous' | 'gentle';
  favoriteMemory: string;
  specialTrait: string;
}

export function DadQuestionnaire({ onComplete }: DadQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [dadInfo, setDadInfo] = useState<DadInfo>({
    name: '',
    favoriteHobby: '',
    personality: 'funny',
    favoriteMemory: '',
    specialTrait: ''
  });

  const questions = [
    {
      key: 'name' as keyof DadInfo,
      title: "What's your dad's name?",
      type: 'input',
      placeholder: 'Enter dad\'s name...'
    },
    {
      key: 'favoriteHobby' as keyof DadInfo,
      title: "What's his favorite hobby or activity?",
      type: 'input',
      placeholder: 'Golf, cooking, reading, fixing things...'
    },
    {
      key: 'personality' as keyof DadInfo,
      title: "Which best describes dad's personality?",
      type: 'radio',
      options: [
        { value: 'funny', label: 'Funny & Jokes Around', emoji: '😄' },
        { value: 'serious', label: 'Wise & Thoughtful', emoji: '🤔' },
        { value: 'adventurous', label: 'Active & Adventurous', emoji: '🏃‍♂️' },
        { value: 'gentle', label: 'Caring & Gentle', emoji: '🤗' }
      ]
    },
    {
      key: 'favoriteMemory' as keyof DadInfo,
      title: "Share a favorite memory with dad",
      type: 'textarea',
      placeholder: 'A special moment, trip, or time you spent together...'
    },
    {
      key: 'specialTrait' as keyof DadInfo,
      title: "What makes dad special or unique?",
      type: 'textarea',
      placeholder: 'His superpower, what he teaches you, why he\'s the best...'
    }
  ];

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(dadInfo);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const updateDadInfo = (key: keyof DadInfo, value: string) => {
    setDadInfo(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const value = dadInfo[currentQ.key];
    return value && value.toString().trim().length > 0;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm text-primary font-semibold">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <motion.div 
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {currentQ.title}
          </h2>

          {currentQ.type === 'input' && (
            <div className="space-y-2">
              <Input
                placeholder={currentQ.placeholder}
                value={dadInfo[currentQ.key] as string}
                onChange={(e) => updateDadInfo(currentQ.key, e.target.value)}
                className="text-base bg-input text-foreground border-border focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
          )}

          {currentQ.type === 'textarea' && (
            <div className="space-y-2">
              <Textarea
                placeholder={currentQ.placeholder}
                value={dadInfo[currentQ.key] as string}
                onChange={(e) => updateDadInfo(currentQ.key, e.target.value)}
                className="text-base min-h-[100px] resize-none bg-input text-foreground border-border focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
          )}

          {currentQ.type === 'radio' && currentQ.options && (
            <RadioGroup
              value={dadInfo[currentQ.key] as string}
              onValueChange={(value) => updateDadInfo(currentQ.key, value)}
              className="space-y-3"
            >
              {currentQ.options.map((option) => (
                <motion.div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex items-center space-x-2 cursor-pointer flex-1"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-base text-gray-800 dark:text-gray-200 font-medium">{option.label}</span>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="px-6"
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6"
          >
            {isLastQuestion ? 'Create Card' : 'Next'}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          We'll use this info to create a personalized Father's Day card
        </p>
      </motion.div>
    </div>
  );
}