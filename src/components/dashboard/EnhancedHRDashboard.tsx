import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  TrendingUp,
  Clock,
  Award,
  Target
} from 'lucide-react';
import HRDashboard from './HRDashboard';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import CandidateManagement from './CandidateManagement';
import CandidateSummary from './CandidateSummary';
import InterviewCalendar from './InterviewCalendar';

const EnhancedHRDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      component: <HRDashboard />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      component: <AdvancedAnalyticsDashboard />
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: <Users className="w-4 h-4" />,
      component: <CandidateManagement />
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: <Calendar className="w-4 h-4" />,
      component: <InterviewCalendar />
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: <FileText className="w-4 h-4" />,
      component: <CandidateSummary />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px] h-12">
              {navigationItems.map((item) => (
                <TabsTrigger 
                  key={item.id} 
                  value={item.id}
                  className="flex items-center gap-2 text-sm"
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {navigationItems.map((item) => (
            <TabsContent key={item.id} value={item.id} className="mt-0">
              {item.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default EnhancedHRDashboard;