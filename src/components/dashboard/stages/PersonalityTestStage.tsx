import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Brain, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PersonalityQuestion {
  id: number;
  question: string;
  options: string[];
}

interface PersonalityTestStageProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const questions: PersonalityQuestion[] = [
  {
    id: 1,
    question: "How do you prefer to work on projects?",
    options: [
      "Independently with minimal supervision",
      "In a small team with close collaboration",
      "In a large team with clear role divisions",
      "Flexibly, adapting to project needs"
    ]
  },
  {
    id: 2,
    question: "When facing a challenging problem, you typically:",
    options: [
      "Analyze it systematically step by step",
      "Brainstorm creative solutions quickly",
      "Seek advice from colleagues or experts",
      "Research similar problems and solutions"
    ]
  },
  {
    id: 3,
    question: "In a team meeting, you are most likely to:",
    options: [
      "Lead the discussion and guide decisions",
      "Contribute ideas when asked",
      "Listen carefully and ask clarifying questions",
      "Take notes and ensure follow-up actions"
    ]
  },
  {
    id: 4,
    question: "How do you handle tight deadlines?",
    options: [
      "Thrive under pressure and deliver quickly",
      "Plan meticulously to avoid last-minute stress",
      "Prioritize tasks and focus on essentials",
      "Collaborate with team to distribute workload"
    ]
  },
  {
    id: 5,
    question: "What motivates you most in your work?",
    options: [
      "Solving complex technical challenges",
      "Building relationships and helping others",
      "Achieving recognition and career advancement",
      "Creating innovative solutions and products"
    ]
  }
];

const PersonalityTestStage: React.FC<PersonalityTestStageProps> = ({ onComplete, isCompleted }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const { toast } = useToast();

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculatePersonalityScore = () => {
    // Simple scoring based on completion and consistency
    const completionScore = (Object.keys(answers).length / questions.length) * 100;
    return Math.round(completionScore);
  };

  const handleSubmit = () => {
    const score = calculatePersonalityScore();
    setIsSubmitted(true);
    
    toast({
      title: "Personality Test Completed",
      description: "Your personality assessment has been submitted successfully",
    });

    setTimeout(() => {
      onComplete(score);
    }, 2000);
  };

  const handleDemoComplete = () => {
    setShowDemo(false);
    const demoScore = 96;
    toast({
      title: "Demo Personality Test Completed",
      description: `Demo completed with ${demoScore}% score`,
    });
    onComplete(demoScore);
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Personality Test - Completed
          </CardTitle>
          <CardDescription>You have successfully completed the personality assessment</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (showDemo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Personality Assessment
          </CardTitle>
          <CardDescription>
            This assessment helps us understand your work style and personality traits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Question:</h4>
              <p className="mb-3">How do you prefer to work on projects?</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>Independently with minimal supervision</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-600"></div>
                  <span className="font-medium">In a small team with close collaboration ✓</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>In a large team with clear role divisions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <span>Flexibly, adapting to project needs</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-800">Assessment Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Answer honestly - there are no right or wrong answers</li>
                <li>Choose the option that best describes you</li>
                <li>Consider your typical behavior, not ideal behavior</li>
                <li>Take your time - there's no time limit</li>
              </ul>
            </div>

            <Button onClick={handleDemoComplete} className="w-full flex items-center gap-2">
              Complete Demo Personality Test
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
            <Brain className="w-5 h-5" />
            Personality Assessment
          </CardTitle>
          <CardDescription>
            This assessment helps us understand your work style and personality traits.
            There are no right or wrong answers - just be honest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Assessment Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Answer honestly - there are no right or wrong answers</li>
                <li>Choose the option that best describes you</li>
                <li>Consider your typical behavior, not ideal behavior</li>
                <li>Take your time - there's no time limit</li>
              </ul>
            </div>
            <Button onClick={() => setIsStarted(true)} className="w-full">
              Start Personality Assessment
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
          <CardTitle>Assessment Submitted</CardTitle>
          <CardDescription>Your personality assessment has been completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-semibold">Assessment Complete!</p>
            <p className="text-gray-600">Thank you for completing the personality assessment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Personality Assessment
        </CardTitle>
        <CardDescription>Answer the following questions honestly</CardDescription>
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
                  <Label htmlFor={`q${question.id}_${optionIndex}`} className="text-sm leading-relaxed">
                    {option}
                  </Label>
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
            Submit Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalityTestStage;