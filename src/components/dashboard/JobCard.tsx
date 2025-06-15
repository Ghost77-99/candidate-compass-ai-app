import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Clock, DollarSign } from 'lucide-react';
import { Job } from '@/services/jobsService';

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, isApplied = false }) => {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (job.job_type === 'internship') {
      return `₹${min}-${max}/hour`;
    }
    if (min && max) {
      return `₹${(min / 1000).toFixed(0)}k - ₹${(max / 1000).toFixed(0)}k`;
    }
    if (min) return `₹${(min / 1000).toFixed(0)}k+`;
    return `Up to ₹${(max! / 1000).toFixed(0)}k`;
  };

  const formatJobType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatExperienceLevel = (level: string) => {
    const levels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level', 
      'senior': 'Senior Level',
      'lead': 'Lead Level',
      'executive': 'Executive'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center space-x-1">
              <Building className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="outline">{formatJobType(job.job_type)}</Badge>
            <Badge className={getExperienceColor(job.experience_level)}>
              {formatExperienceLevel(job.experience_level)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
            <DollarSign className="h-4 w-4" />
            <span>{formatSalary(job.salary_min, job.salary_max)}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Posted {job.posted_date}</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
      
      {job.required_skills && job.required_skills.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Required Skills:</p>
          <div className="flex flex-wrap gap-1">
            {job.required_skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.required_skills.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{job.required_skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-end pt-2">
        <Button 
          size="sm" 
          onClick={() => onApply(job)}
          disabled={isApplied}
          variant={isApplied ? "outline" : "default"}
        >
          {isApplied ? "Applied" : "Apply Now"}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
