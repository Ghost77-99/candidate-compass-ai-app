import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsService } from '@/services/jobsService';
import { useToast } from '@/hooks/use-toast';

interface JobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

const JobCreationModal: React.FC<JobCreationModalProps> = ({ isOpen, onClose, onJobCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'full_time',
    experience_level: 'entry',
    job_category: 'technical',
    applicant_level: '',
    salary_min: '',
    salary_max: '',
    description: '',
    application_deadline: ''
  });
  
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a job",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.company || !formData.description || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting job creation form...');
      
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        job_type: formData.job_type as any,
        experience_level: formData.experience_level as any,
        job_category: formData.job_category as any,
        applicant_level: formData.applicant_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        description: formData.description,
        application_deadline: formData.application_deadline || undefined,
        required_skills: skills,
        posted_by: user.id
      };

      console.log('Creating job with data:', jobData);
      
      const createdJob = await jobsService.createJob(jobData);
      
      console.log('Job created successfully:', createdJob);

      toast({
        title: "Success",
        description: "Job created successfully!",
      });

      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        job_type: 'full_time',
        experience_level: 'entry',
        job_category: 'technical',
        applicant_level: '',
        salary_min: '',
        salary_max: '',
        description: '',
        application_deadline: ''
      });
      setSkills([]);

      onJobCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new job posting
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., TechCorp Inc."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, CA"
                required
              />
            </div>
            <div>
              <Label htmlFor="applicant_level">Applicant Level</Label>
              <Input
                id="applicant_level"
                placeholder="e.g., Entry Level, Mid Level"
                value={formData.applicant_level}
                onChange={(e) => handleInputChange('applicant_level', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="job_type">Job Type</Label>
              <Select value={formData.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_category">Job Category</Label>
              <Select value={formData.job_category} onValueChange={(value) => handleInputChange('job_category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="non_technical">Non-Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary_min">Minimum Salary</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="50000"
                value={formData.salary_min}
                onChange={(e) => handleInputChange('salary_min', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="salary_max">Maximum Salary</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="80000"
                value={formData.salary_max}
                onChange={(e) => handleInputChange('salary_max', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="application_deadline">Application Deadline</Label>
            <Input
              id="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) => handleInputChange('application_deadline', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              required
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationModal;