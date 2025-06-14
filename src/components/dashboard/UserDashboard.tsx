
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, FileText, Search } from 'lucide-react';
import { jobsService, Job } from '@/services/jobsService';
import JobApplicationModal from './JobApplicationModal';
import JobCard from './JobCard';
import ApplicationCard from './ApplicationCard';
import ProfileSummary from './ProfileSummary';
import QuickStats from './QuickStats';
import JobBrowser from './JobBrowser';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const { user, profile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/user');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const handleTabSwitch = (event: any) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('switchTab', handleTabSwitch);
    return () => window.removeEventListener('switchTab', handleTabSwitch);
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      const [jobsData, applicationsData] = await Promise.all([
        jobsService.getActiveJobs(),
        jobsService.getUserApplications(user.id)
      ]);
      
      setJobs(jobsData.slice(0, 3)); // Show only first 3 jobs in overview
      setApplications(applicationsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmitted = () => {
    loadDashboardData(); // Refresh the data
  };

  const isJobApplied = (jobId: string) => {
    return applications.some(app => app.job_id === jobId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">TalentHub</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={profile.profile_image_url || ""} alt={profile.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-gray-600">Track your applications and discover new opportunities.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile & Applications */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Summary */}
                <ProfileSummary profile={profile} />

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Your latest job applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading applications...</p>
                      </div>
                    ) : applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.slice(0, 3).map((app) => (
                          <ApplicationCard key={app.id} application={app} />
                        ))}
                        {applications.length > 3 && (
                          <Button variant="outline" className="w-full" onClick={() => setActiveTab('applications')}>
                            View All Applications ({applications.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No applications yet</p>
                        <p className="text-sm text-gray-400 mb-4">Apply to jobs to track your progress here</p>
                        <Button onClick={() => setActiveTab('jobs')}>
                          <Search className="w-4 h-4 mr-2" />
                          Browse Jobs
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Job Openings & Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Jobs</CardTitle>
                    <CardDescription>Latest opportunities for you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading jobs...</p>
                      </div>
                    ) : jobs.length > 0 ? (
                      <div className="space-y-4">
                        {jobs.map((job) => (
                          <JobCard 
                            key={job.id} 
                            job={job} 
                            onApply={handleApplyClick}
                            isApplied={isJobApplied(job.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No jobs available</p>
                        <p className="text-sm text-gray-400">Check back later for new opportunities</p>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab('jobs')}
                    >
                      Browse All Jobs
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <QuickStats applications={applications} />
              </div>
            </div>
          </TabsContent>

          {/* Browse Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <JobBrowser />
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>
                  Track all your job applications and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                ) : applications.length > 0 ? (
                  <div className="space-y-6">
                    {applications.map((app) => (
                      <ApplicationCard key={app.id} application={app} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-6">Start your career journey by applying to jobs that match your skills</p>
                    <Button onClick={() => setActiveTab('jobs')}>
                      <Search className="w-4 h-4 mr-2" />
                      Browse Available Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <JobApplicationModal
        job={selectedJob}
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onApplicationSubmitted={handleApplicationSubmitted}
      />
    </div>
  );
};

export default UserDashboard;
