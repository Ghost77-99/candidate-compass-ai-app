
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Building2, Briefcase, TrendingUp, Users, Calendar } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Briefcase className="w-8 h-8 text-blue-600" />,
      title: "Smart Job Matching",
      description: "AI-powered job recommendations based on skills and experience"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Multi-Stage Interviews",
      description: "Comprehensive evaluation through aptitude, technical, and HR rounds"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Performance Analytics",
      description: "Detailed insights and progress tracking for candidates and recruiters"
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      title: "Interview Scheduling",
      description: "Seamless scheduling and management of interview appointments"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TalentHub
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Hiring Process{" "}
            </span>
            with AI
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Connect top talent with leading companies through our intelligent HR management platform.
            Streamlined interviews, smart matching, and comprehensive analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Card className="w-full sm:w-80 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-blue-200"
                  onClick={() => navigate('/auth/user')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-600">Job Seekers</CardTitle>
                <CardDescription>
                  Find your dream job and track your application progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
                  Sign In as Job Seeker
                </Button>
              </CardContent>
            </Card>

            <Card className="w-full sm:w-80 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-purple-200"
                  onClick={() => navigate('/auth/hr')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-purple-600">HR & Recruiters</CardTitle>
                <CardDescription>
                  Manage candidates and streamline your hiring process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold">
                  Sign In as HR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose TalentHub?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with intuitive design to revolutionize how companies hire and candidates apply.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">TalentHub</h1>
          </div>
          <p className="text-gray-400">
            © 2024 TalentHub. Revolutionizing HR management with AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
