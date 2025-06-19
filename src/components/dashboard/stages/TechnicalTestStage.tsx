import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Code, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TechnicalQuestion {
  id: number;
  question: string;
  type: 'mcq' | 'code';
  options?: string[];
  correct?: number;
}

interface TechnicalTestStageProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const questions: TechnicalQuestion[] = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    type: 'mcq',
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correct: 1
  },
  {
    id: 2,
    question: "Which of the following is NOT a JavaScript primitive type?",
    type: 'mcq',
    options: ["string", "number", "object", "boolean"],
    correct: 2
  },
  {
    id: 3,
    question: "Write a function to reverse a string in JavaScript:",
    type: 'code'
  },
  {
    id: 4,
    question: "What is the difference between SQL JOIN types?",
    type: 'mcq',
    options: [
      "INNER JOIN returns all rows",
      "LEFT JOIN includes all rows from left table",
      "RIGHT JOIN is same as LEFT JOIN",
      "FULL JOIN is not supported in SQL"
    ],
    correct: 1
  },
  {
    id: 5,
    question: "Write a function to find the factorial of a number:",
    type: 'code'
  }
];

const TechnicalTestStage: React.FC<TechnicalTestStageProps> = ({ onComplete, isCompleted }) => {
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
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

  const handleMCQAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleCodeAnswer = (questionId: number, code: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: code }));
  };

  const calculateScore = () => {
    let score = 0;
    let totalQuestions = questions.length;
    
    questions.forEach(question => {
      if (question.type === 'mcq' && answers[question.id] === question.correct) {
        score += 20; // 20 points per MCQ
      } else if (question.type === 'code' && answers[question.id] && answers[question.id].trim().length > 50) {
        score += 20; // Basic scoring for code questions based on length
      }
    });
    
    return Math.min(score, 100);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setIsSubmitted(true);
    
    toast({
      title: "Test Submitted",
      description: `Technical test completed with score: ${score}%`,
    });

    setTimeout(() => {
      onComplete(score);
    }, 2000);
  };

  const handleDemoComplete = () => {
    setShowDemo(false);
    const demoScore = 92;
    toast({
      title: "Demo Technical Test Completed",
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
            Technical Test - Completed
          </CardTitle>
          <CardDescription>You have successfully completed the technical assessment</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (showDemo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Technical Test
          </CardTitle>
          <CardDescription>
            This technical assessment includes both multiple choice and coding questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Question:</h4>
              <p className="mb-3">What is the time complexity of binary search?</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>O(n)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-600"></div>
                  <span className="font-medium">O(log n) ✓</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>O(n log n)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>O(1)</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Coding Question:</h4>
              <p className="mb-3">Write a function to reverse a string in JavaScript:</p>
              <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                <div>function reverseString(str) &#123;</div>
                <div>&nbsp;&nbsp;return str.split('').reverse().join('');</div>
                <div>&#125;</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-800">Test Instructions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Mix of multiple choice and coding questions</li>
                <li>30 minutes total time limit</li>
                <li>Code questions require working solutions</li>
                <li>You can use any programming language for coding questions</li>
              </ul>
            </div>

            <Button onClick={handleDemoComplete} className="w-full flex items-center gap-2">
              Complete Demo Technical Test
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
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Technical Test
          </CardTitle>
          <CardDescription>
            This technical assessment includes both multiple choice and coding questions.
            Time limit: 30 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Test Instructions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Mix of multiple choice and coding questions</li>
                <li>30 minutes total time limit</li>
                <li>Code questions require working solutions</li>
                <li>You can use any programming language for coding questions</li>
                <li>Submit before time runs out</li>
              </ul>
            </div>
            <Button onClick={() => setIsStarted(true)} className="w-full">
              Start Technical Test
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
          <CardDescription>Your technical assessment has been submitted for review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Processing your submission...</p>
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
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Technical Test
            </CardTitle>
            <CardDescription>Answer all questions within the time limit</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="w-5 h-5" />
            <span className={timeLeft < 600 ? 'text-red-600' : 'text-blue-600'}>
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
            
            {question.type === 'mcq' ? (
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => handleMCQAnswer(question.id, parseInt(value))}
              >
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}_${optionIndex}`} />
                    <Label htmlFor={`q${question.id}_${optionIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div>
                <Label htmlFor={`code_${question.id}`}>Your Code:</Label>
                <Textarea
                  id={`code_${question.id}`}
                  placeholder="Write your code here..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleCodeAnswer(question.id, e.target.value)}
                  rows={6}
                  className="font-mono text-sm mt-2"
                />
              </div>
            )}
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-600">
            Questions answered: {Object.keys(answers).length} / {questions.length}
          </div>
          <Button onClick={handleSubmit}>
            Submit Technical Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalTestStage;