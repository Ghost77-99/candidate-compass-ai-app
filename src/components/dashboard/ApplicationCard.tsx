
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Building } from 'lucide-react';

interface ApplicationCardProps {
  application: any;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'aptitude_test': return 'bg-yellow-100 text-yellow-800';
      case 'group_discussion': return 'bg-orange-100 text-orange-800';
      case 'technical_test': return 'bg-purple-100 text-purple-800';
      case 'hr_round': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{application.jobs?.title || 'Job Title'}</h4>
          <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
            <Building className="h-4 w-4" />
            <span>{application.jobs?.company || 'Company'}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Applied on {formatDate(application.applied_date)}
          </p>
        </div>
        <Badge className={getStatusColor(application.status)}>
          {formatStatus(application.status)}
        </Badge>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium">{application.progress_percentage}%</span>
        </div>
        <Progress value={application.progress_percentage} className="h-2" />
      </div>

      {application.next_interview_date && (
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Next: {application.next_interview_stage}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(application.next_interview_date)} at {application.next_interview_time}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
