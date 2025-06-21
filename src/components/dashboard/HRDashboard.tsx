import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Users, TrendingUp, Calendar, LogOut, FileText, Star, Clock, Briefcase, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { applicationService } from '@/services/applicationService';
import { jobsService } from '@/services/jobsService';
import CandidateManagement from './CandidateManagement';
import CandidateSummary from './CandidateSummary';
import HRProfileSummary from './HRProfileSummary';
import JobCreationModal from './JobCreationModal';
import { useToast } from '@/hooks/use-toast';

const HRDashboard = () => {
  const { user, profile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    inProgress: 0,
    interviewsToday: 0,
    hiredThisMonth: 0
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/hr');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      console.log('Loading HR dashboard stats...');
      const applications = await applicationService.getAllApplicationsForHR();
      
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      const interviewsToday = applications.filter(app => 
        app.next_interview_date && new Date(app.next_interview_date).toDateString() === today
      ).length;
      
      const hiredThisMonth = applications.filter(app => {
        if (app.status !== 'completed') return false;
        const appliedDate = new Date(app.applied_date);
        return appliedDate.getMonth() === thisMonth && appliedDate.getFullYear() === thisYear;
      }).length;
      
      const inProgress = applications.filter(app => 
        !['completed', 'rejected'].includes(app.status)
      ).length;
      
      setStats({
        totalApplications: applications.length,
        inProgress,
        interviewsToday,
        hiredThisMonth
      });

      console.log('Stats loaded successfully:', {
        totalApplications: applications.length,
        inProgress,
        interviewsToday,
        hiredThisMonth
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    }
  };

  const handleJobCreated = async () => {
    console.log('Job created, refreshing stats...');
    await loadStats();
    toast({
      title: "Success",
      description: "Job created successfully and is now visible to job seekers!",
    });
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

  const handleLogout = () => {
    logout();
  };

  const statsData = [
    {
      title: 'Total Applicants',
      value: stats.totalApplications.toString(),
      change: `${stats.totalApplications > 0 ? '+' : ''}${stats.totalApplications}`,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-600'
    },
    {
      title: 'In Progress',
      value: stats.inProgress.toString(),
      change: `${stats.inProgress} active`,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600'
    },
    {
      title: 'Interviews Today',
      value: stats.interviewsToday.toString(),
      change: stats.interviewsToday > 0 ? 'Scheduled' : 'None today',
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      color: 'text-green-600'
    },
    {
      title: 'Hired This Month',
      value: stats.hiredThisMonth.toString(),
      change: `${stats.hiredThisMonth > 0 ? '+' : ''}${stats.hiredThisMonth} completed`,
      icon: <Star className="w-6 h-6 text-orange-600" />,
      color: 'text-orange-600'
    }
  ];

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
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {profile.name?.charAt(0) || 'H'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile.name}!
            </h2>
            <p className="text-gray-600">Manage candidates and track your hiring progress.</p>
          </div>
          <Button onClick={() => setIsJobModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Job
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-full">
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Overview</CardTitle>
                <CardDescription>
                  Key metrics and recent activity in your hiring pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                    <div className="text-sm text-gray-600">Total Applications</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.totalApplications > 0 ? Math.round((stats.hiredThisMonth / stats.totalApplications) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Candidate Management</CardTitle>
                <CardDescription>
                  Manage job applications and track candidate progress through the hiring process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CandidateManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Candidate Performance Summary</CardTitle>
                <CardDescription>
                  Overview of candidate performance across all interview stages with hiring recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CandidateSummary />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <HRProfileSummary profile={profile} onProfileUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </div>

      <JobCreationModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
};

export default HRDashboard;