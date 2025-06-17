
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Briefcase, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { applicationStageService, ApplicationStage } from '@/services/applicationStageService';
import StageProgressTracker from './StageProgressTracker';

interface Application {
  id: string;
  job_id: string;
  status: string;
  applied_date: string;
  current_stage: string;
  qualification_score: number;
  resume_summary: string;
  progress_percentage: number;
  jobs: {
    title: string;
    company: string;
    location: string;
  };
}

interface EnhancedApplicationCardProps {
  application: Application;
}

const EnhancedApplicationCard: React.FC<EnhancedApplicationCardProps> = ({ application }) => {
  const [stages, setStages] = useState<ApplicationStage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStages();
  }, [application.id]);

  const loadStages = async () => {
    try {
      setIsLoading(true);
      const stagesData = await applicationStageService.getApplicationStages(application.id);
      setStages(stagesData);
    } catch (error) {
      console.error('Error loading stages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const completedStages = stages.filter(s => s.status === 'completed').length;
  const totalStages = stages.length;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {application.jobs.title}
            </h3>
            <p className="text-gray-600 mb-2">{application.jobs.company}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{application.jobs.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Applied: {new Date(application.applied_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {formatStatus(application.status)}
          </Badge>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Application Progress</span>
            <span className="text-sm text-gray-600">
              {completedStages}/{totalStages} stages completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <p className="text-xs text-gray-500">
            Current Stage: {formatStatus(application.current_stage)}
          </p>
        </div>

        {/* Qualification Score */}
        {application.qualification_score > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Resume Qualification Score
              </span>
              <span className={`text-sm font-semibold ${
                application.qualification_score >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {application.qualification_score}%
              </span>
            </div>
            {application.qualification_score >= 75 ? (
              <p className="text-xs text-green-600 mt-1">✓ Qualification criteria met</p>
            ) : (
              <p className="text-xs text-red-600 mt-1">✗ Below qualification threshold (75%)</p>
            )}
          </div>
        )}

        {/* Resume Summary */}
        {application.resume_summary && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Resume Summary</h4>
            <p className="text-sm text-gray-600">{application.resume_summary}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Application Progress - {application.jobs.title}
                </DialogTitle>
              </DialogHeader>
              {isLoading ? (
                <div className="text-center py-8">Loading stages...</div>
              ) : (
                <StageProgressTracker 
                  stages={stages} 
                  currentStage={application.current_stage}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedApplicationCard;
