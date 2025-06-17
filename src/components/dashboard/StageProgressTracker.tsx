
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Stage {
  id: string;
  stage_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score: number;
  completed_at: string | null;
}

interface StageProgressTrackerProps {
  stages: Stage[];
  currentStage: string;
  className?: string;
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

const StageProgressTracker: React.FC<StageProgressTrackerProps> = ({ 
  stages, 
  currentStage, 
  className = '' 
}) => {
  const getStageStatus = (stageName: string) => {
    return stages.find(s => s.stage_name === stageName);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const completedStages = stages.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedStages / STAGE_ORDER.length) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Application Progress</CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-gray-600">
            {completedStages} of {STAGE_ORDER.length} stages completed
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {STAGE_ORDER.map((stageName, index) => {
            const stage = getStageStatus(stageName);
            const status = stage?.status || 'pending';
            const isActive = currentStage === stageName;
            
            return (
              <div
                key={stageName}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {STAGE_LABELS[stageName as keyof typeof STAGE_LABELS]}
                    </h4>
                    {stage?.completed_at && (
                      <p className="text-xs text-gray-500">
                        Completed on {new Date(stage.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {stage?.score > 0 && (
                    <span className="text-sm text-gray-600">
                      Score: {stage.score}%
                    </span>
                  )}
                  <Badge className={getStatusColor(status)} variant="secondary">
                    {status.replace('_', ' ')}
                  </Badge>
                  {getStatusIcon(status)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StageProgressTracker;
