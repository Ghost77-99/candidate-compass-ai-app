import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InterviewFeedbackFormProps {
  interviewId: string;
  candidateName: string;
  position: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const InterviewFeedbackForm: React.FC<InterviewFeedbackFormProps> = ({
  interviewId,
  candidateName,
  position,
  onSubmit,
  onCancel
}) => {
  const [feedback, setFeedback] = useState({
    technicalScore: [75],
    communicationScore: [75],
    problemSolvingScore: [75],
    culturalFitScore: [75],
    overallRecommendation: '',
    detailedFeedback: '',
    strengths: [] as string[],
    areasForImprovement: [] as string[],
    followUpQuestions: [] as string[]
  });

  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addStrength = () => {
    if (newStrength.trim()) {
      setFeedback(prev => ({
        ...prev,
        strengths: [...prev.strengths, newStrength.trim()]
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    setFeedback(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }));
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFeedback(prev => ({
        ...prev,
        areasForImprovement: [...prev.areasForImprovement, newImprovement.trim()]
      }));
      setNewImprovement('');
    }
  };

  const removeImprovement = (index: number) => {
    setFeedback(prev => ({
      ...prev,
      areasForImprovement: prev.areasForImprovement.filter((_, i) => i !== index)
    }));
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFeedback(prev => ({
        ...prev,
        followUpQuestions: [...prev.followUpQuestions, newQuestion.trim()]
      }));
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setFeedback(prev => ({
      ...prev,
      followUpQuestions: prev.followUpQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.overallRecommendation) {
      toast({
        title: "Error",
        description: "Please select an overall recommendation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('interview_feedback')
        .insert({
          interview_id: interviewId,
          technical_score: feedback.technicalScore[0],
          communication_score: feedback.communicationScore[0],
          problem_solving_score: feedback.problemSolvingScore[0],
          cultural_fit_score: feedback.culturalFitScore[0],
          overall_recommendation: feedback.overallRecommendation,
          detailed_feedback: feedback.detailedFeedback,
          strengths: feedback.strengths,
          areas_for_improvement: feedback.areasForImprovement,
          follow_up_questions: feedback.followUpQuestions
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interview feedback submitted successfully",
      });

      onSubmit();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Interview Feedback</CardTitle>
        <CardDescription>
          Provide detailed feedback for {candidateName} - {position}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scoring Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Technical Skills ({feedback.technicalScore[0]}%)</Label>
                <Slider
                  value={feedback.technicalScore}
                  onValueChange={(value) => setFeedback(prev => ({ ...prev, technicalScore: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Communication ({feedback.communicationScore[0]}%)</Label>
                <Slider
                  value={feedback.communicationScore}
                  onValueChange={(value) => setFeedback(prev => ({ ...prev, communicationScore: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Problem Solving ({feedback.problemSolvingScore[0]}%)</Label>
                <Slider
                  value={feedback.problemSolvingScore}
                  onValueChange={(value) => setFeedback(prev => ({ ...prev, problemSolvingScore: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Cultural Fit ({feedback.culturalFitScore[0]}%)</Label>
                <Slider
                  value={feedback.culturalFitScore}
                  onValueChange={(value) => setFeedback(prev => ({ ...prev, culturalFitScore: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Overall Recommendation */}
          <div>
            <Label htmlFor="recommendation">Overall Recommendation *</Label>
            <Select value={feedback.overallRecommendation} onValueChange={(value) => 
              setFeedback(prev => ({ ...prev, overallRecommendation: value }))
            }>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strong_hire">Strong Hire</SelectItem>
                <SelectItem value="hire">Hire</SelectItem>
                <SelectItem value="no_hire">No Hire</SelectItem>
                <SelectItem value="strong_no_hire">Strong No Hire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Detailed Feedback */}
          <div>
            <Label htmlFor="detailed-feedback">Detailed Feedback</Label>
            <Textarea
              id="detailed-feedback"
              placeholder="Provide detailed feedback about the candidate's performance..."
              value={feedback.detailedFeedback}
              onChange={(e) => setFeedback(prev => ({ ...prev, detailedFeedback: e.target.value }))}
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Strengths */}
          <div>
            <Label>Strengths</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add a strength..."
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
              />
              <Button type="button" onClick={addStrength} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedback.strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {strength}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeStrength(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div>
            <Label>Areas for Improvement</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add an area for improvement..."
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
              />
              <Button type="button" onClick={addImprovement} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedback.areasForImprovement.map((improvement, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {improvement}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeImprovement(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Follow-up Questions */}
          <div>
            <Label>Follow-up Questions</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add a follow-up question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
              />
              <Button type="button" onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedback.followUpQuestions.map((question, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {question}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeQuestion(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InterviewFeedbackForm;