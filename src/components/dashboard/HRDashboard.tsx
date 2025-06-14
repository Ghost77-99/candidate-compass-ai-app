
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Building2, Users, TrendingUp, Calendar, Search, Eye, Star, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HRDashboard = () => {
  const { user, profile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/hr');
    }
  }, [user, isLoading, navigate]);

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

  // Mock data for demonstration - will be replaced with real data later
  const mockCandidates = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      position: 'Senior Frontend Developer',
      appliedDate: '2024-01-15',
      currentStage: 'Technical Test',
      progress: 75,
      overallScore: 85,
      stages: [
        { name: 'Aptitude Test', status: 'completed', score: 88, feedback: 'Excellent logical reasoning and problem-solving skills.' },
        { name: 'Group Discussion', status: 'completed', score: 82, feedback: 'Good communication and leadership qualities.' },
        { name: 'Technical Test', status: 'in-progress', score: null, feedback: null },
        { name: 'HR Round', status: 'pending', score: null, feedback: null }
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      experience: '5 years',
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      position: 'UX Designer',
      appliedDate: '2024-01-14',
      currentStage: 'HR Round',
      progress: 90,
      overallScore: 92,
      stages: [
        { name: 'Aptitude Test', status: 'completed', score: 95, feedback: 'Outstanding analytical and creative thinking.' },
        { name: 'Group Discussion', status: 'completed', score: 90, feedback: 'Excellent collaboration and presentation skills.' },
        { name: 'Technical Test', status: 'completed', score: 91, feedback: 'Strong design principles and user research abilities.' },
        { name: 'HR Round', status: 'in-progress', score: null, feedback: null }
      ],
      skills: ['Figma', 'User Research', 'Prototyping', 'Adobe Creative Suite'],
      experience: '4 years',
      location: 'New York, NY'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      position: 'Product Manager',
      appliedDate: '2024-01-12',
      currentStage: 'Group Discussion',
      progress: 50,
      overallScore: 78,
      stages: [
        { name: 'Aptitude Test', status: 'completed', score: 78, feedback: 'Good problem-solving skills, could improve on analytical thinking.' },
        { name: 'Group Discussion', status: 'in-progress', score: null, feedback: null },
        { name: 'Technical Test', status: 'pending', score: null, feedback: null },
        { name: 'HR Round', status: 'pending', score: null, feedback: null }
      ],
      skills: ['Product Strategy', 'Analytics', 'Agile', 'Leadership'],
      experience: '6 years',
      location: 'Austin, TX'
    }
  ];

  const filteredCandidates = mockCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = [
    {
      title: 'Total Applicants',
      value: '124',
      change: '+12%',
      icon: <Users className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'In Progress',
      value: '48',
      change: '+8%',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />
    },
    {
      title: 'Interviews Today',
      value: '8',
      change: '+2',
      icon: <Calendar className="w-6 h-6 text-green-600" />
    },
    {
      title: 'Hired This Month',
      value: '15',
      change: '+25%',
      icon: <Star className="w-6 h-6 text-orange-600" />
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
                    {profile.name?.split(' ').map(n => n[0]).join('')}
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
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-full">
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Candidate Management</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                                <p className="text-gray-600">{candidate.position}</p>
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Applied: {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                                <span>Experience: {candidate.experience}</span>
                                <span>Location: {candidate.location}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidate.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-3">
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Overall Score:</span>
                                <span className={`font-bold text-lg ${getScoreColor(candidate.overallScore)}`}>
                                  {candidate.overallScore}%
                                </span>
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {candidate.currentStage}
                              </Badge>
                            </div>
                            <div className="w-48">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Progress</span>
                                <span className="text-gray-600">{candidate.progress}%</span>
                              </div>
                              <Progress value={candidate.progress} className="h-2" />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Candidate View Modal */}
            {selectedCandidate && (
              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-purple-600">
                      {selectedCandidate.name} - Detailed Report
                    </CardTitle>
                    <CardDescription>
                      {selectedCandidate.position} • Applied on {new Date(selectedCandidate.appliedDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedCandidate(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Overall Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-4xl font-bold mb-2 ${getScoreColor(selectedCandidate.overallScore)}`}>
                            {selectedCandidate.overallScore}%
                          </div>
                          <p className="text-gray-600">Overall Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stage-wise Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stage-wise Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedCandidate.stages.map((stage, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full ${getStageColor(stage.status)}`} />
                                <span className="font-medium text-gray-900">{stage.name}</span>
                              </div>
                              {stage.score && (
                                <Badge variant="secondary" className={getScoreColor(stage.score)}>
                                  {stage.score}%
                                </Badge>
                              )}
                            </div>
                            {stage.feedback && (
                              <p className="text-gray-600 text-sm mt-2 pl-7">
                                <strong>Feedback:</strong> {stage.feedback}
                              </p>
                            )}
                            {stage.status === 'in-progress' && (
                              <p className="text-blue-600 text-sm mt-2 pl-7">
                                <strong>Status:</strong> Currently in progress
                              </p>
                            )}
                            {stage.status === 'pending' && (
                              <p className="text-gray-500 text-sm mt-2 pl-7">
                                <strong>Status:</strong> Awaiting previous stage completion
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills and Experience */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Experience & Location</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Experience:</span>
                          <p className="text-gray-600">{selectedCandidate.experience}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-600">{selectedCandidate.location}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Comprehensive analytics and reporting features will be available here to track hiring performance and candidate insights.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HRDashboard;
