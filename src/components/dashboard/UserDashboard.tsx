
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Building2, Calendar, Clock, MapPin, DollarSign, Users, FileText, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mockJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
      requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
      applied: false
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Innovation Labs',
      location: 'New York, NY',
      salary: '$130,000 - $160,000',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Join our product team to drive innovation and user experience...',
      requirements: ['Product Strategy', 'Analytics', 'Leadership', '3+ years experience'],
      applied: false
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'Remote',
      salary: '$90,000 - $110,000',
      type: 'Full-time',
      posted: '3 days ago',
      description: 'Create beautiful and intuitive user experiences for our digital products...',
      requirements: ['Figma', 'User Research', 'Prototyping', '2+ years experience'],
      applied: true
    }
  ];

  const mockApplications = [
    {
      id: '1',
      jobTitle: 'UX Designer',
      company: 'Design Studio',
      appliedDate: '2024-01-15',
      currentStage: 'Technical Test',
      progress: 75,
      stages: [
        { name: 'Applied', status: 'completed', date: '2024-01-15' },
        { name: 'Aptitude Test', status: 'completed', score: 85, date: '2024-01-16' },
        { name: 'Group Discussion', status: 'completed', score: 90, date: '2024-01-17' },
        { name: 'Technical Test', status: 'in-progress', date: '2024-01-18' },
        { name: 'HR Round', status: 'pending', date: null }
      ],
      nextInterview: {
        date: '2024-01-20',
        time: '2:00 PM',
        type: 'Technical Interview',
        interviewer: 'John Smith'
      }
    }
  ];

  const handleApplyJob = (jobId: string) => {
    toast({
      title: "Application Submitted!",
      description: "Your application has been submitted successfully. You will receive an email confirmation shortly.",
    });
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TalentHub</h1>
                <p className="text-sm text-gray-600">Job Seeker Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user?.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="jobs">Job Openings</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Available Job Openings</h2>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {mockJobs.length} positions
              </Badge>
            </div>

            <div className="grid gap-6">
              {mockJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-blue-600">{job.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={job.applied ? "default" : "secondary"}>
                          {job.applied ? "Applied" : job.type}
                        </Badge>
                        <span className="text-sm text-gray-500">{job.posted}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-gray-700">
                      {job.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      disabled={job.applied}
                      onClick={() => handleApplyJob(job.id)}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      {job.applied ? "Already Applied" : "Apply Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>

            {mockApplications.map((app) => (
              <Card key={app.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-purple-600">{app.jobTitle}</CardTitle>
                      <p className="text-gray-600">{app.company}</p>
                      <p className="text-sm text-gray-500">Applied on {new Date(app.appliedDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {app.currentStage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Application Progress</span>
                      <span className="text-sm text-gray-600">{app.progress}%</span>
                    </div>
                    <Progress value={app.progress} className="h-2" />
                  </div>

                  {/* Stages */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Interview Stages</h4>
                    <div className="space-y-3">
                      {app.stages.map((stage, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${getStageColor(stage.status)}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{stage.name}</span>
                              {stage.score && (
                                <Badge variant="secondary">Score: {stage.score}%</Badge>
                              )}
                            </div>
                            {stage.date && (
                              <p className="text-sm text-gray-600">
                                {stage.status === 'completed' ? 'Completed' : 'Scheduled'} on {new Date(stage.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Interview */}
                  {app.nextInterview && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-600 flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          Next Interview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <p className="text-gray-600">{new Date(app.nextInterview.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Time:</span>
                            <p className="text-gray-600">{app.nextInterview.time}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <p className="text-gray-600">{app.nextInterview.type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Interviewer:</span>
                            <p className="text-gray-600">{app.nextInterview.interviewer}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{user?.name}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-600">{user?.profile?.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <p className="text-gray-600">{user?.profile?.experience}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user?.profile?.skills?.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
