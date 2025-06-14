
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickStatsProps {
  applications: any[];
}

const QuickStats: React.FC<QuickStatsProps> = ({ applications }) => {
  const stats = {
    total: applications.length,
    inProgress: applications.filter(app => 
      ['aptitude_test', 'group_discussion', 'technical_test', 'hr_round'].includes(app.status)
    ).length,
    interviews: applications.filter(app => 
      ['technical_test', 'hr_round'].includes(app.status)
    ).length,
    completed: applications.filter(app => app.status === 'completed').length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.interviews}</div>
            <div className="text-sm text-gray-600">Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
