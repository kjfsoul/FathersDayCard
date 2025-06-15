import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TriviaGameProps {
  onGameEnd: (score: number) => void;
}

interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: string;
}

export function TriviaGame({ onGameEnd }: TriviaGameProps) {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seenQuestionIds, setSeenQuestionIds] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0); // For fetching new question

  useEffect(() => {
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    setLoading(true);
    setSelectedAnswer('');
    setShowResult(false);

    if (questionCount === 0 && seenQuestionIds.length > 0) { // Reset seen questions if game restarts (questionCount is 0)
      setSeenQuestionIds([]);
    }

    try {
      const category = ['dad', 'general', 'sports'][Math.floor(Math.random() * 3)];
      const response = await fetch(`/api/trivia/${category}`);
      const data: TriviaQuestion = await response.json();

      if (seenQuestionIds.includes(data.id) && retryCount < 5) {
        console.log(`Question ${data.id} already seen. Retrying... (${retryCount + 1})`);
        setRetryCount(retryCount + 1);
        loadNextQuestion(); // Recursive call to try fetching a new question
        return;
      }
      
      setRetryCount(0); // Reset retry count for the next question
      setQuestion(data);
      setSeenQuestionIds(prev => [...prev, data.id]);
      
      // Shuffle answers
      const allAnswers = [...data.incorrect_answers, data.correct_answer];
      setAnswers(shuffleArray(allAnswers));
    } catch (error) {
      console.error('Error loading question:', error);
      // Fallback to built-in questions
      loadFallbackQuestion(); // Fallback might also need seenQuestionIds logic if complex
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackQuestion = () => { // Basic fallback, doesn't interact with seenQuestionIds for simplicity here
    const fallbackQuestions = [
      {
        id: '1',
        category: 'dad',
        question: 'When is Father\'s Day celebrated in the United States?',
        correct_answer: 'Third Sunday in June',
        incorrect_answers: ['First Sunday in June', 'Second Sunday in May', 'Last Sunday in June'],
        difficulty: 'medium'
      },
      {
        id: '2',
        category: 'general',
        question: 'What does "www" stand for in a website address?',
        correct_answer: 'World Wide Web',
        incorrect_answers: ['World Wide Window', 'Web Wide World', 'Wide World Web'],
        difficulty: 'easy'
      },
      {
        id: '3',
        category: 'sports',
        question: 'How many players are on a basketball team on the court at one time?',
        correct_answer: '5',
        incorrect_answers: ['6', '7', '4'],
        difficulty: 'easy'
      }
    ];
    
    const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    setQuestion(randomQuestion);
    const allAnswers = [...randomQuestion.incorrect_answers, randomQuestion.correct_answer];
    setAnswers(shuffleArray(allAnswers));
  };

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === question?.correct_answer) {
      const points = question.difficulty === 'hard' ? 30 : question.difficulty === 'medium' ? 20 : 10;
      setScore(score + points);
    }
    
    setQuestionCount(questionCount + 1);
    
    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (questionCount >= 9) {
        endGame();
      } else {
        loadNextQuestion();
      }
    }, 2000);
  };

  const endGame = () => {
    onGameEnd(score);
    // Optionally reset seenQuestionIds here if game can be re-played without full remount
    // setSeenQuestionIds([]);
    // For now, relying on questionCount === 0 check in loadNextQuestion for reset.
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-red-500">Error loading question</div>
        <Button onClick={loadNextQuestion} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div className="text-lg">
          Question {questionCount + 1}/10
        </div>
        <div className="text-lg">
          Score: <span className="text-primary font-bold">{score}</span>
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              {question.category.toUpperCase()} • {question.difficulty.toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {question.question}
            </h2>
          </div>
        </CardContent>
      </Card>

      {/* Answer Options */}
      <div className="grid gap-3">
        {answers.map((answer, index) => (
          <motion.button
            key={index}
            className={`p-4 text-left border-2 rounded-lg transition-all ${
              !showResult
                ? 'border-border hover:border-primary hover:bg-accent'
                : selectedAnswer === answer
                  ? answer === question.correct_answer
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-red-500 bg-red-100 text-red-800'
                  : answer === question.correct_answer
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-border bg-muted'
            }`}
            onClick={() => handleAnswerSelect(answer)}
            disabled={showResult}
            whileHover={{ scale: !showResult ? 1.02 : 1 }}
            whileTap={{ scale: !showResult ? 0.98 : 1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-base">{answer}</span>
              {showResult && answer === question.correct_answer && (
                <span className="ml-auto text-green-600">✓</span>
              )}
              {showResult && selectedAnswer === answer && answer !== question.correct_answer && (
                <span className="ml-auto text-red-600">✗</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Result Message */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          {selectedAnswer === question.correct_answer ? (
            <div className="text-green-600 font-semibold">Correct! 🎉</div>
          ) : (
            <div className="text-red-600 font-semibold">
              Wrong! The correct answer was: {question.correct_answer}
            </div>
          )}
          <div className="text-sm text-muted-foreground mt-2">
            {questionCount >= 9 ? 'Game complete!' : 'Next question loading...'}
          </div>
        </motion.div>
      )}

      {/* End Game Button */}
      {!showResult && (
        <div className="text-center">
          <Button onClick={endGame} variant="outline">
            End Game
          </Button>
        </div>
      )}
    </div>
  );
}