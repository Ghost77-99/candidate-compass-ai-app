import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { analyticsService, CandidateAnalytics, InterviewAnalytics } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdvancedAnalyticsDashboard = () => {
  const [candidateAnalytics, setCandidateAnalytics] = useState<CandidateAnalytics | null>(null);
  const [interviewAnalytics, setInterviewAnalytics] = useState<InterviewAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [candidateData, interviewData] = await Promise.all([
        analyticsService.getCandidateAnalytics(),
        analyticsService.getInterviewAnalytics()
      ]);
      
      setCandidateAnalytics(candidateData);
      setInterviewAnalytics(interviewData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const statusChartData = candidateAnalytics ? Object.entries(candidateAnalytics.applicationsByStatus).map(([status, count]) => ({
    status: status.replace('_', ' ').toUpperCase(),
    count
  })) : [];

  const stageChartData = candidateAnalytics ? Object.entries(candidateAnalytics.applicationsByStage).map(([stage, count]) => ({
    stage: stage.replace('_', ' ').toUpperCase(),
    count
  })) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your hiring process</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{candidateAnalytics?.totalApplications || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                    <p className="text-3xl font-bold text-gray-900">{interviewAnalytics?.totalInterviews || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Interview Rating</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {interviewAnalytics?.averageRating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {candidateAnalytics ? 
                        Math.round(((candidateAnalytics.applicationsByStatus.completed || 0) / candidateAnalytics.totalApplications) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status Distribution</CardTitle>
                <CardDescription>Current status of all applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Funnel</CardTitle>
                <CardDescription>Candidate progression through stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidateAnalytics?.hiringFunnelData.map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stage.stage.replace('_', ' ').toUpperCase()}</span>
                        <span>{stage.count} ({stage.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={stage.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Applications by Stage</CardTitle>
                <CardDescription>Current stage distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Required Skills</CardTitle>
                <CardDescription>Most in-demand skills across job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidateAnalytics?.topSkills.slice(0, 8).map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(skill.count / (candidateAnalytics?.topSkills[0]?.count || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{skill.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Applications</CardTitle>
                <CardDescription>Application trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={candidateAnalytics?.monthlyApplications || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualification Score Distribution</CardTitle>
                <CardDescription>Resume qualification scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={candidateAnalytics?.qualificationScoreDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interviews by Stage</CardTitle>
                <CardDescription>Distribution of interviews across stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(interviewAnalytics?.interviewsByStage || {}).map(([stage, count]) => ({
                    stage: stage.replace('_', ' ').toUpperCase(),
                    count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Feedback Summary</CardTitle>
                <CardDescription>Average scores across evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(interviewAnalytics?.feedbackSummary || {}).map(([criteria, score]) => (
                    <div key={criteria} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{criteria.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>{score.toFixed(1)}/100</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for your hiring process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {candidateAnalytics ? Math.round(candidateAnalytics.totalApplications / 30) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Applications/Month</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {interviewAnalytics ? Math.round(interviewAnalytics.totalInterviews / 30) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Interviews/Month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {candidateAnalytics ? 
                      Math.round(((candidateAnalytics.applicationsByStatus.completed || 0) / candidateAnalytics.totalApplications) * 100) 
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;