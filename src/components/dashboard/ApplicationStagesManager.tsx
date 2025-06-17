
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { applicationStageService } from '@/services/applicationStageService';
import StageProgressTracker from './StageProgressTracker';
import EnhancedResumeUpload from './EnhancedResumeUpload';
import AptitudeTestStage from './stages/AptitudeTestStage';
import GroupDiscussionStage from './stages/GroupDiscussionStage';
import TechnicalTestStage from './stages/TechnicalTestStage';
import HRRoundStage from './stages/HRRoundStage';
import PersonalityTestStage from './stages/PersonalityTestStage';

interface ApplicationStagesManagerProps {
  applicationId: string;
  currentStage: string;
  onStageComplete: () => void;
}

const STAGE_ORDER = [
  'resume_upload',
  'aptitude_test', 
  'group_discussion',
  'technical_test',
  'hr_round',
  'personality_test'
];

const STAGE_LABELS = {
  'resume_upload': 'Resume Upload',
  'aptitude_test': 'Aptitude Test',
  'group_discussion': 'Group Discussion', 
  'technical_test': 'Technical Test',
  'hr_round': 'HR Round',
  'personality_test': 'Personality Test'
};

const ApplicationStagesManager: React.FC<ApplicationStagesManagerProps> = ({
  applicationId,
  currentStage,
  onStageComplete
}) => {
  const [stages, setStages] = useState<any[]>([]);
  const [activeStage, setActiveStage] = useState(currentStage);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStages();
  }, [applicationId]);

  const loadStages = async () => {
    try {
      const stagesData = await applicationStageService.getApplicationStages(applicationId);
      setStages(stagesData);
    } catch (error) {
      console.error('Error loading stages:', error);
      toast({
        title: "Error",
        description: "Failed to load application stages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageComplete = async (stageName: string, score: number) => {
    try {
      await applicationStageService.updateStageStatus(applicationId, stageName, {
        status: 'completed',
        score: score
      });

      // Move to next stage
      const currentIndex = STAGE_ORDER.indexOf(stageName);
      const nextStage = STAGE_ORDER[currentIndex + 1];
      
      if (nextStage) {
        setActiveStage(nextStage);
      }

      await loadStages();
      onStageComplete();

      toast({
        title: "Stage Completed",
        description: `${STAGE_LABELS[stageName as keyof typeof STAGE_LABELS]} completed successfully!`,
      });
    } catch (error) {
      console.error('Error completing stage:', error);
      toast({
        title: "Error",
        description: "Failed to complete stage",
        variant: "destructive",
      });
    }
  };

  const getStageStatus = (stageName: string) => {
    return stages.find(stage => stage.stage_name === stageName);
  };

  const isStageAccessible = (stageName: string) => {
    const currentIndex = STAGE_ORDER.indexOf(activeStage);
    const stageIndex = STAGE_ORDER.indexOf(stageName);
    return stageIndex <= currentIndex;
  };

  const renderStageComponent = (stageName: string) => {
    const stageStatus = getStageStatus(stageName);
    const isCompleted = stageStatus?.status === 'completed';
    const isAccessible = isStageAccessible(stageName);

    if (!isAccessible) {
      return (
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              {STAGE_LABELS[stageName as keyof typeof STAGE_LABELS]} - Locked
            </CardTitle>
            <CardDescription>Complete previous stages to unlock</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    switch (stageName) {
      case 'resume_upload':
        return (
          <EnhancedResumeUpload
            applicationId={applicationId}
            onUploadComplete={(score) => handleStageComplete(stageName, score)}
            isCompleted={isCompleted}
          />
        );
      case 'aptitude_test':
        return (
          <AptitudeTestStage
            onComplete={(score) => handleStageComplete(stageName, score)}
            isCompleted={isCompleted}
          />
        );
      case 'group_discussion':
        return (
          <GroupDiscussionStage
            onComplete={(score) => handleStageComplete(stageName, score)}
            isCompleted={isCompleted}
          />
        );
      case 'technical_test':
        return (
          <TechnicalTestStage
            onComplete={(score) => handleStageComplete(stageName, score)}
            isCompleted={isCompleted}
          />
        );
      case 'hr_round':
        return (
          <HRRoundStage
            onComplete={(score) => handleStageComplete(stageName, score)}
            isCompleted={isCompleted}
          />
        );
      case 'personality_test':
        return (
          <PersonalityTestStage
            onComplete={(score) => handleStageComplete(stageName, score)}
            isCompleted={isCompleted}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading application stages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StageProgressTracker 
        stages={stages} 
        currentStage={activeStage}
      />
      
      <div className="space-y-6">
        {STAGE_ORDER.map((stageName) => (
          <div key={stageName}>
            {renderStageComponent(stageName)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationStagesManager;
