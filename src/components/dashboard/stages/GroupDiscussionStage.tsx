import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroupDiscussionStageProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const GroupDiscussionStage: React.FC<GroupDiscussionStageProps> = ({ onComplete, isCompleted }) => {
  const [selectedSlot, setSelectedSlot] = useState('');
  const [responses, setResponses] = useState({
    topic: '',
    keyPoints: '',
    conclusion: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const { toast } = useToast();

  const timeSlots = [
    '2024-01-20 10:00 AM',
    '2024-01-20 2:00 PM',
    '2024-01-21 10:00 AM',
    '2024-01-21 2:00 PM',
    '2024-01-22 10:00 AM'
  ];

  const handleSubmit = () => {
    if (!selectedSlot || !responses.topic || !responses.keyPoints || !responses.conclusion) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a time slot",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
    
    toast({
      title: "Registration Successful",
      description: `You have been registered for the group discussion on ${selectedSlot}`,
    });

    // Simulate completion with a base score
    setTimeout(() => {
      onComplete(85); // Base score for scheduling
    }, 2000);
  };

  const handleDemoComplete = () => {
    setShowDemo(false);
    const demoScore = 88;
    toast({
      title: "Demo Group Discussion Completed",
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
            Group Discussion - Completed
          </CardTitle>
          <CardDescription>You have successfully completed the group discussion</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (showDemo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Discussion
          </CardTitle>
          <CardDescription>
            Participate in a group discussion to showcase your communication and teamwork skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Discussion Topic:</h4>
              <p className="mb-3">"Remote Work vs Office Work: Which is more effective for productivity?"</p>
              
              <div className="space-y-2 text-sm">
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <strong>Your Role:</strong> Present balanced arguments and listen to others' viewpoints
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <strong>Key Skills Evaluated:</strong> Communication, Leadership, Teamwork, Critical Thinking
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-800">Discussion Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Be respectful and listen to others' viewpoints</li>
                <li>Contribute meaningfully to the discussion</li>
                <li>Support your arguments with relevant examples</li>
                <li>Maintain professional communication throughout</li>
              </ul>
            </div>

            <Button onClick={handleDemoComplete} className="w-full flex items-center gap-2">
              Complete Demo Discussion
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
          <CardTitle>Registration Confirmed</CardTitle>
          <CardDescription>Your group discussion has been scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-semibold">Registration Successful!</p>
            <p className="text-gray-600">You will receive further details via email</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Group Discussion
        </CardTitle>
        <CardDescription>
          Select a time slot and prepare for the group discussion session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="time-slot">Select Time Slot</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {timeSlots.map((slot, index) => (
                <label key={index} className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot}
                    checked={selectedSlot === slot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{slot}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Preferred Discussion Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Technology in Education, Remote Work Culture"
                value={responses.topic}
                onChange={(e) => setResponses(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="key-points">Key Points You'd Like to Discuss</Label>
              <Textarea
                id="key-points"
                placeholder="List 3-4 key points you would like to discuss on this topic"
                value={responses.keyPoints}
                onChange={(e) => setResponses(prev => ({ ...prev, keyPoints: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="conclusion">Expected Conclusion/Outcome</Label>
              <Textarea
                id="conclusion"
                placeholder="What do you hope to achieve from this discussion?"
                value={responses.conclusion}
                onChange={(e) => setResponses(prev => ({ ...prev, conclusion: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Discussion Guidelines:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Be respectful and listen to others' viewpoints</li>
              <li>Contribute meaningfully to the discussion</li>
              <li>Support your arguments with relevant examples</li>
              <li>Maintain professional communication throughout</li>
            </ul>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Register for Group Discussion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupDiscussionStage;