import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface AptitudeTestStageProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const questions: Question[] = [
  {
    id: 1,
    question: "If a train travels 120 miles in 2 hours, what is its average speed?",
    options: ["50 mph", "60 mph", "70 mph", "80 mph"],
    correct: 1
  },
  {
    id: 2,
    question: "Which number comes next in the sequence: 2, 6, 18, 54, ?",
    options: ["108", "162", "216", "270"],
    correct: 1
  },
  {
    id: 3,
    question: "If all roses are flowers and some flowers are red, which statement is definitely true?",
    options: ["All roses are red", "Some roses are red", "Some roses might be red", "No roses are red"],
    correct: 2
  },
  {
    id: 4,
    question: "A rectangle has a length of 12 cm and width of 8 cm. What is its area?",
    options: ["20 sq cm", "40 sq cm", "96 sq cm", "120 sq cm"],
    correct: 2
  },
  {
    id: 5,
    question: "If 3x + 7 = 22, what is the value of x?",
    options: ["3", "5", "7", "9"],
    correct: 1
  }
];

const AptitudeTestStage: React.FC<AptitudeTestStageProps> = ({ onComplete, isCompleted }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isStarted && timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isStarted, isSubmitted]);

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setIsSubmitted(true);
    
    toast({
      title: "Test Submitted",
      description: `You scored ${score}%`,
    });

    setTimeout(() => {
      onComplete(score);
    }, 2000);
  };

  const handleDemoComplete = () => {
    setShowDemo(false);
    // Simulate completing the test with a good score
    const demoScore = 85;
    toast({
      title: "Demo Test Completed",
      description: `Demo completed with ${demoScore}% score`,
    });
    onComplete(demoScore);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Aptitude Test - Completed
          </CardTitle>
          <CardDescription>You have successfully completed the aptitude test</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (showDemo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aptitude Test</CardTitle>
          <CardDescription>
            This is a sample aptitude test with logical reasoning and mathematical questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Question:</h4>
              <p className="mb-3">If a train travels 120 miles in 2 hours, what is its average speed?</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>50 mph</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-600"></div>
                  <span className="font-medium">60 mph ✓</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>70 mph</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>80 mph</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-800">Test Instructions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>You have 15 minutes to complete 5 questions</li>
                <li>Each question carries equal marks</li>
                <li>Choose the best answer for each question</li>
                <li>Submit before time runs out</li>
              </ul>
            </div>

            <Button onClick={handleDemoComplete} className="w-full flex items-center gap-2">
              Complete Demo Test
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aptitude Test</CardTitle>
          <CardDescription>
            This test consists of 5 questions and has a time limit of 15 minutes. 
            Make sure you have a stable internet connection before starting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Test Instructions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You have 15 minutes to complete 5 questions</li>
                <li>Each question carries equal marks</li>
                <li>Once started, the timer cannot be paused</li>
                <li>Submit before time runs out</li>
              </ul>
            </div>
            <Button onClick={() => setIsStarted(true)} className="w-full">
              Start Test
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Submitted</CardTitle>
          <CardDescription>Your answers have been recorded. Processing results...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Calculating your score...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Aptitude Test</CardTitle>
            <CardDescription>Answer all questions within the time limit</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="w-5 h-5" />
            <span className={timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              {index + 1}. {question.question}
            </h4>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}_${optionIndex}`} />
                  <Label htmlFor={`q${question.id}_${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-600">
            Questions answered: {Object.keys(answers).length} / {questions.length}
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AptitudeTestStage;