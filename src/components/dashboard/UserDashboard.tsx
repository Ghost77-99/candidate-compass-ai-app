
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, FileText, User, Briefcase, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user, profile, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/user');
    }
  }, [user, isLoading, navigate]);

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

  // Mock data for demonstration - will be replaced with real data later
  const jobOpenings = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp Inc.",
      description: "Build amazing user interfaces with React and TypeScript",
      location: "San Francisco, CA",
      type: "Full-time",
      postedDate: "2024-01-10"
    },
    {
      id: 2,
      title: "Backend Engineer",
      company: "DataFlow Solutions",
      description: "Design and implement scalable backend systems",
      location: "New York, NY",
      type: "Full-time",
      postedDate: "2024-01-12"
    },
    {
      id: 3,
      title: "UX Designer",
      company: "Creative Studios",
      description: "Create intuitive and beautiful user experiences",
      location: "Los Angeles, CA",
      type: "Contract",
      postedDate: "2024-01-15"
    }
  ];

  const applications = [
    {
      id: 1,
      jobTitle: "Frontend Developer",
      company: "TechCorp Inc.",
      status: "Technical Test",
      progress: 75,
      appliedDate: "2024-01-11",
      nextInterview: {
        stage: "HR Round",
        date: "2024-01-20",
        time: "2:00 PM"
      }
    },
    {
      id: 2,
      jobTitle: "Backend Engineer",
      company: "DataFlow Solutions",
      status: "Group Discussion",
      progress: 50,
      appliedDate: "2024-01-13",
      nextInterview: {
        stage: "Group Discussion",
        date: "2024-01-18",
        time: "10:00 AM"
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Aptitude Test': return 'bg-yellow-100 text-yellow-800';
      case 'Group Discussion': return 'bg-orange-100 text-orange-800';
      case 'Technical Test': return 'bg-purple-100 text-purple-800';
      case 'HR Round': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.name}!</h2>
          <p className="text-gray-600">Track your applications and discover new opportunities.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Applications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.length ? (
                        profile.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                    <p className="text-gray-600">
                      {profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-600">{profile.location || 'Not specified'}</p>
                  </div>
                </div>
                <Button className="mt-4" variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Current Applications */}
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your application progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{app.jobTitle}</h4>
                          <p className="text-sm text-gray-600">{app.company}</p>
                          <p className="text-xs text-gray-500">Applied on {app.appliedDate}</p>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium">{app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-2" />
                      </div>

                      {app.nextInterview && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Next: {app.nextInterview.stage}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <Clock className="h-4 w-4" />
                            <span>{app.nextInterview.date} at {app.nextInterview.time}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Job Openings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Openings</CardTitle>
                <CardDescription>Latest opportunities for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobOpenings.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <p className="text-xs text-gray-500">{job.location} • {job.type}</p>
                      </div>
                      
                      <p className="text-sm text-gray-700">{job.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Posted {job.postedDate}</span>
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View All Jobs
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-sm text-gray-600">Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8</div>
                    <div className="text-sm text-gray-600">Saved Jobs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
