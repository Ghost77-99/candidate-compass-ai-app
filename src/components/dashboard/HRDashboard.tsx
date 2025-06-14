
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Users, TrendingUp, Calendar, LogOut, FileText, Star, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { applicationService } from '@/services/applicationService';
import CandidateManagement from './CandidateManagement';
import { useToast } from '@/hooks/use-toast';

const HRDashboard = () => {
  const { user, profile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TalentHub</h1>
                <p className="text-sm text-gray-600">HR Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {profile.name?.split(' ').map(n => n[0]).join('') || 'HR'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="font-medium text-gray-900">{profile.name}</p>
                  <p className="text-sm text-gray-600">{profile.department || 'HR Department'}</p>
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
        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-6">
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

            {/* Candidate Management */}
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

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-semibold">{Math.floor(stats.totalApplications * 0.3)} applications</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">{stats.totalApplications} applications</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold text-green-600">
                        {stats.totalApplications > 0 ? Math.round((stats.hiredThisMonth / stats.totalApplications) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Scheduled Today</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">{stats.interviewsToday}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-semibold text-purple-600">{stats.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-semibold text-green-600">{stats.hiredThisMonth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Time to Hire</span>
                      <span className="font-semibold">14 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Interview Show Rate</span>
                      <span className="font-semibold text-green-600">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Offer Acceptance</span>
                      <span className="font-semibold text-blue-600">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Info */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Comprehensive analytics and reporting features for tracking hiring performance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Detailed reporting features including charts, trends analysis, and performance metrics will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HRDashboard;
