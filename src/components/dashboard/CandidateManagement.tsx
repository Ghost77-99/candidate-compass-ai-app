
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Calendar, Clock, MapPin, Star } from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_date: string;
  progress_percentage: number;
  next_interview_date?: string;
  next_interview_time?: string;
  next_interview_stage?: string;
  cover_letter?: string;
  notes?: string;
  jobs: {
    title: string;
    company: string;
    location: string;
  };
  profiles: {
    name: string;
    email: string;
    skills: string[];
    experience_years: number;
    location: string;
    bio: string;
  };
}

const CandidateManagement = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Interview scheduling form state
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewStage, setInterviewStage] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    const filtered = applications.filter(app =>
      app.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApplications(filtered);
  }, [searchTerm, applications]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await applicationService.getAllApplicationsForHR();
      setApplications(data);
      setFilteredApplications(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      setIsUpdating(true);
      const progressMap: Record<string, number> = {
        'applied': 10,
        'aptitude_test': 25,
        'group_discussion': 50,
        'technical_test': 75,
        'hr_round': 90,
        'completed': 100,
        'rejected': 0
      };

      await applicationService.updateApplicationStatus(applicationId, {
        status: status as any,
        progress_percentage: progressMap[status]
      });

      await loadApplications();
      
      toast({
        title: "Success",
        description: "Application status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const scheduleInterview = async () => {
    if (!selectedApplication || !interviewDate || !interviewTime || !interviewStage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      await applicationService.scheduleInterview(selectedApplication.id, {
        stage: interviewStage,
        scheduled_date: interviewDate,
        scheduled_time: interviewTime,
        meeting_link: meetingLink || undefined
      });

      await loadApplications();
      
      // Reset form
      setInterviewDate('');
      setInterviewTime('');
      setInterviewStage('');
      setMeetingLink('');
      
      toast({
        title: "Success",
        description: "Interview scheduled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule interview.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {application.profiles.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{application.profiles.name}</h3>
                      <p className="text-gray-600">{application.jobs.title}</p>
                      <p className="text-sm text-gray-500">{application.profiles.email}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Applied: {new Date(application.applied_date).toLocaleDateString()}</span>
                      <span>Experience: {application.profiles.experience_years} years</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{application.profiles.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {application.profiles.skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(application.profiles.skills?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(application.profiles.skills?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <Badge className={getStatusColor(application.status)}>
                      {formatStatus(application.status)}
                    </Badge>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm text-gray-600">Progress:</span>
                      <span className="text-sm font-medium">{application.progress_percentage}%</span>
                    </div>
                    <div className="w-32 mt-1">
                      <Progress value={application.progress_percentage} className="h-2" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Select onValueChange={(value) => updateApplicationStatus(application.id, value)} disabled={isUpdating}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="aptitude_test">Aptitude Test</SelectItem>
                        <SelectItem value="group_discussion">Group Discussion</SelectItem>
                        <SelectItem value="technical_test">Technical Test</SelectItem>
                        <SelectItem value="hr_round">HR Round</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Interview</DialogTitle>
                          <DialogDescription>
                            Schedule an interview for {application.profiles.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="interview-stage">Interview Stage</Label>
                            <Select value={interviewStage} onValueChange={setInterviewStage}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aptitude Test">Aptitude Test</SelectItem>
                                <SelectItem value="Group Discussion">Group Discussion</SelectItem>
                                <SelectItem value="Technical Test">Technical Test</SelectItem>
                                <SelectItem value="HR Round">HR Round</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="interview-date">Date</Label>
                            <Input
                              id="interview-date"
                              type="date"
                              value={interviewDate}
                              onChange={(e) => setInterviewDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="interview-time">Time</Label>
                            <Input
                              id="interview-time"
                              type="time"
                              value={interviewTime}
                              onChange={(e) => setInterviewTime(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="meeting-link">Meeting Link (Optional)</Label>
                            <Input
                              id="meeting-link"
                              type="url"
                              placeholder="https://meet.google.com/..."
                              value={meetingLink}
                              onChange={(e) => setMeetingLink(e.target.value)}
                            />
                          </div>
                          <Button onClick={scheduleInterview} disabled={isUpdating} className="w-full">
                            {isUpdating ? 'Scheduling...' : 'Schedule Interview'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {application.next_interview_date && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Next: {application.next_interview_stage}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(application.next_interview_date).toLocaleDateString()} at {application.next_interview_time}</span>
                  </div>
                </div>
              )}

              {application.cover_letter && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                  <p className="text-sm text-gray-600">{application.cover_letter}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Star className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">No applications found</p>
          <p className="text-sm text-gray-400">Applications will appear here when candidates apply for jobs</p>
        </div>
      )}
    </div>
  );
};

export default CandidateManagement;
