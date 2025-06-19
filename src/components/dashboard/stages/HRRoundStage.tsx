import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, CheckCircle, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HRRoundStageProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const HRRoundStage: React.FC<HRRoundStageProps> = ({ onComplete, isCompleted }) => {
  const [selectedSlot, setSelectedSlot] = useState('');
  const [responses, setResponses] = useState({
    motivation: '',
    experience: '',
    expectations: '',
    availability: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const { toast } = useToast();

  const interviewSlots = [
    '2024-01-25 9:00 AM - 9:30 AM',
    '2024-01-25 10:00 AM - 10:30 AM',
    '2024-01-25 2:00 PM - 2:30 PM',
    '2024-01-25 3:00 PM - 3:30 PM',
    '2024-01-26 9:00 AM - 9:30 AM',
    '2024-01-26 10:00 AM - 10:30 AM'
  ];

  const handleSubmit = () => {
    if (!selectedSlot || !responses.motivation || !responses.experience || !responses.expectations) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a time slot",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
    
    toast({
      title: "HR Interview Scheduled",
      description: `Your interview has been scheduled for ${selectedSlot}`,
    });

    // Simulate completion with a base score
    setTimeout(() => {
      onComplete(90); // Base score for scheduling
    }, 2000);
  };

  const handleDemoComplete = () => {
    setShowDemo(false);
    const demoScore = 94;
    toast({
      title: "Demo HR Round Completed",
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
            HR Round - Completed
          </CardTitle>
          <CardDescription>Your HR interview has been successfully completed</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (showDemo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            HR Round Interview
          </CardTitle>
          <CardDescription>
            Final interview with HR to discuss your fit for the role and company culture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample HR Questions:</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <strong>Q:</strong> Why are you interested in this position?
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <strong>Q:</strong> Tell us about your career goals and how this role fits in.
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                  <strong>Q:</strong> What are your salary expectations?
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-800">Interview Preparation Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Review the job description and company information</li>
                <li>Prepare examples of your achievements and problem-solving skills</li>
                <li>Think about questions you'd like to ask about the role and company</li>
                <li>Be ready to discuss your career aspirations</li>
              </ul>
            </div>

            <Button onClick={handleDemoComplete} className="w-full flex items-center gap-2">
              Complete Demo HR Round
              <ArrowRight className="w-4 h-4" />
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
          <CardTitle>Interview Scheduled</CardTitle>
          <CardDescription>Your HR interview appointment has been confirmed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-semibold">Interview Confirmed!</p>
            <p className="text-gray-600">You will receive calendar invite and meeting details via email</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          HR Round Interview
        </CardTitle>
        <CardDescription>
          Schedule your HR interview and provide preliminary information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="interview-slot">Select Interview Time Slot</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {interviewSlots.map((slot, index) => (
                <label key={index} className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="interviewSlot"
                    value={slot}
                    checked={selectedSlot === slot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{slot}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="motivation">Why are you interested in this position? *</Label>
              <Textarea
                id="motivation"
                placeholder="Explain your motivation and what attracts you to this role"
                value={responses.motivation}
                onChange={(e) => setResponses(prev => ({ ...prev, motivation: e.target.value }))}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="experience">Tell us about your relevant experience *</Label>
              <Textarea
                id="experience"
                placeholder="Describe your professional experience and key achievements"
                value={responses.experience}
                onChange={(e) => setResponses(prev => ({ ...prev, experience: e.target.value }))}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="expectations">What are your salary expectations? *</Label>
              <Input
                id="expectations"
                placeholder="e.g., $70,000 - $80,000 per annum"
                value={responses.expectations}
                onChange={(e) => setResponses(prev => ({ ...prev, expectations: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="availability">When can you start?</Label>
              <Input
                id="availability"
                placeholder="e.g., Immediately, 2 weeks notice, 1 month"
                value={responses.availability}
                onChange={(e) => setResponses(prev => ({ ...prev, availability: e.target.value }))}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Interview Preparation Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Review the job description and company information</li>
              <li>Prepare examples of your achievements and problem-solving skills</li>
              <li>Think about questions you'd like to ask about the role and company</li>
              <li>Ensure you have a stable internet connection for video interview</li>
              <li>Test your camera and microphone beforehand</li>
            </ul>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Schedule HR Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRRoundStage;