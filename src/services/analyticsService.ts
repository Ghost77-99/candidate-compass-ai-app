import { supabase } from '@/integrations/supabase/client';

export interface CandidateAnalytics {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  applicationsByStage: Record<string, number>;
  averageTimeToHire: number;
  topSkills: Array<{ skill: string; count: number }>;
  hiringFunnelData: Array<{ stage: string; count: number; percentage: number }>;
  monthlyApplications: Array<{ month: string; count: number }>;
  qualificationScoreDistribution: Array<{ range: string; count: number }>;
}

export interface InterviewAnalytics {
  totalInterviews: number;
  averageRating: number;
  interviewsByStage: Record<string, number>;
  feedbackSummary: {
    technicalAverage: number;
    communicationAverage: number;
    problemSolvingAverage: number;
    culturalFitAverage: number;
  };
  recommendationDistribution: Record<string, number>;
}

export const analyticsService = {
  async getCandidateAnalytics(): Promise<CandidateAnalytics> {
    try {
      // Get total applications
      const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      // Get applications by status
      const { data: statusData } = await supabase
        .from('applications')
        .select('status')
        .not('status', 'is', null);

      const applicationsByStatus = statusData?.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get applications by current stage
      const { data: stageData } = await supabase
        .from('applications')
        .select('current_stage')
        .not('current_stage', 'is', null);

      const applicationsByStage = stageData?.reduce((acc, app) => {
        acc[app.current_stage] = (acc[app.current_stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get top skills from job requirements
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('required_skills')
        .not('required_skills', 'is', null);

      const skillCounts: Record<string, number> = {};
      jobsData?.forEach(job => {
        job.required_skills?.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      });

      const topSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }));

      // Get hiring funnel data
      const stages = ['applied', 'aptitude_test', 'group_discussion', 'technical_test', 'hr_round', 'completed'];
      const hiringFunnelData = stages.map(stage => {
        const count = applicationsByStatus[stage] || 0;
        const percentage = totalApplications ? (count / totalApplications) * 100 : 0;
        return { stage, count, percentage };
      });

      // Get monthly applications (last 12 months)
      const { data: monthlyData } = await supabase
        .from('applications')
        .select('applied_date')
        .gte('applied_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const monthlyApplications = monthlyData?.reduce((acc, app) => {
        const month = new Date(app.applied_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ month, count: 1 });
        }
        return acc;
      }, [] as Array<{ month: string; count: number }>) || [];

      // Get qualification score distribution
      const { data: qualificationData } = await supabase
        .from('applications')
        .select('qualification_score')
        .not('qualification_score', 'is', null)
        .gt('qualification_score', 0);

      const qualificationRanges = [
        { range: '0-25', min: 0, max: 25 },
        { range: '26-50', min: 26, max: 50 },
        { range: '51-75', min: 51, max: 75 },
        { range: '76-100', min: 76, max: 100 }
      ];

      const qualificationScoreDistribution = qualificationRanges.map(({ range, min, max }) => {
        const count = qualificationData?.filter(app => 
          app.qualification_score >= min && app.qualification_score <= max
        ).length || 0;
        return { range, count };
      });

      return {
        totalApplications: totalApplications || 0,
        applicationsByStatus,
        applicationsByStage,
        averageTimeToHire: 0, // This would require more complex calculation
        topSkills,
        hiringFunnelData,
        monthlyApplications,
        qualificationScoreDistribution
      };
    } catch (error) {
      console.error('Error fetching candidate analytics:', error);
      throw error;
    }
  },

  async getInterviewAnalytics(): Promise<InterviewAnalytics> {
    try {
      // Get total interviews
      const { count: totalInterviews } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true });

      // Get average rating
      const { data: ratingData } = await supabase
        .from('interviews')
        .select('rating')
        .not('rating', 'is', null);

      const averageRating = ratingData?.length 
        ? ratingData.reduce((sum, interview) => sum + interview.rating, 0) / ratingData.length
        : 0;

      // Get interviews by stage
      const { data: stageData } = await supabase
        .from('interviews')
        .select('stage');

      const interviewsByStage = stageData?.reduce((acc, interview) => {
        acc[interview.stage] = (acc[interview.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get feedback summary (this would require the interview_feedback table)
      const feedbackSummary = {
        technicalAverage: 0,
        communicationAverage: 0,
        problemSolvingAverage: 0,
        culturalFitAverage: 0
      };

      // Get recommendation distribution (placeholder)
      const recommendationDistribution = {
        'strong_hire': 0,
        'hire': 0,
        'no_hire': 0,
        'strong_no_hire': 0
      };

      return {
        totalInterviews: totalInterviews || 0,
        averageRating,
        interviewsByStage,
        feedbackSummary,
        recommendationDistribution
      };
    } catch (error) {
      console.error('Error fetching interview analytics:', error);
      throw error;
    }
  },

  async getJobPerformanceMetrics(jobId: string) {
    try {
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          *,
          application_stages(*)
        `)
        .eq('job_id', jobId);

      if (!applications) return null;

      const totalApplications = applications.length;
      const completedApplications = applications.filter(app => app.status === 'completed').length;
      const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
      const inProgressApplications = totalApplications - completedApplications - rejectedApplications;

      const conversionRate = totalApplications > 0 ? (completedApplications / totalApplications) * 100 : 0;

      // Calculate average time in each stage
      const stageMetrics = applications.reduce((acc, app) => {
        app.application_stages?.forEach((stage: any) => {
          if (!acc[stage.stage_name]) {
            acc[stage.stage_name] = { total: 0, completed: 0 };
          }
          acc[stage.stage_name].total++;
          if (stage.status === 'completed') {
            acc[stage.stage_name].completed++;
          }
        });
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      return {
        totalApplications,
        completedApplications,
        rejectedApplications,
        inProgressApplications,
        conversionRate,
        stageMetrics
      };
    } catch (error) {
      console.error('Error fetching job performance metrics:', error);
      throw error;
    }
  }
};