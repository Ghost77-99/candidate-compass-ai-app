import { supabase } from '@/integrations/supabase/client';

export interface InterviewSchedule {
  id: string;
  application_id: string;
  interview_type: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  location?: string;
  meeting_link?: string;
  meeting_platform: 'zoom' | 'teams' | 'meet' | 'in_person' | 'phone';
  interviewer_ids: string[];
  preparation_notes?: string;
  agenda: any;
  status: 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  reminder_sent: boolean;
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_id: string;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  cultural_fit_score: number;
  overall_recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  detailed_feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
  follow_up_questions: string[];
}

export const interviewService = {
  async scheduleInterview(scheduleData: Partial<InterviewSchedule>) {
    const { data, error } = await supabase
      .from('interview_schedules')
      .insert(scheduleData)
      .select()
      .single();

    if (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }

    return data;
  },

  async getInterviewSchedules(applicationId?: string) {
    let query = supabase
      .from('interview_schedules')
      .select(`
        *,
        applications:application_id (
          id,
          profiles:user_id (name, email),
          jobs:job_id (title, company)
        )
      `)
      .order('scheduled_date', { ascending: true });

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching interview schedules:', error);
      throw error;
    }

    return data || [];
  },

  async updateInterviewStatus(interviewId: string, status: InterviewSchedule['status']) {
    const { data, error } = await supabase
      .from('interview_schedules')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', interviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating interview status:', error);
      throw error;
    }

    return data;
  },

  async submitInterviewFeedback(feedbackData: Partial<InterviewFeedback>) {
    const { data, error } = await supabase
      .from('interview_feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      console.error('Error submitting interview feedback:', error);
      throw error;
    }

    return data;
  },

  async getInterviewFeedback(interviewId: string) {
    const { data, error } = await supabase
      .from('interview_feedback')
      .select(`
        *,
        profiles:interviewer_id (name, email)
      `)
      .eq('interview_id', interviewId);

    if (error) {
      console.error('Error fetching interview feedback:', error);
      throw error;
    }

    return data || [];
  },

  async getUpcomingInterviews(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('interview_schedules')
      .select(`
        *,
        applications:application_id (
          profiles:user_id (name, email),
          jobs:job_id (title, company)
        )
      `)
      .gte('scheduled_date', today)
      .in('status', ['scheduled', 'confirmed'])
      .order('scheduled_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming interviews:', error);
      throw error;
    }

    return data || [];
  },

  async sendInterviewReminder(interviewId: string) {
    // This would typically integrate with an email service
    // For now, we'll just update the reminder_sent flag
    const { data, error } = await supabase
      .from('interview_schedules')
      .update({ reminder_sent: true })
      .eq('id', interviewId)
      .select()
      .single();

    if (error) {
      console.error('Error sending interview reminder:', error);
      throw error;
    }

    return data;
  }
};