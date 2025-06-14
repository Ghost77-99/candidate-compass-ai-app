
import { supabase } from '@/integrations/supabase/client';

export interface ApplicationUpdate {
  status?: 'applied' | 'aptitude_test' | 'group_discussion' | 'technical_test' | 'hr_round' | 'completed' | 'rejected';
  progress_percentage?: number;
  next_interview_date?: string;
  next_interview_time?: string;
  next_interview_stage?: string;
  notes?: string;
}

export const applicationService = {
  async updateApplicationStatus(applicationId: string, updates: ApplicationUpdate) {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      throw error;
    }

    return data;
  },

  async getAllApplicationsForHR() {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id (
          title,
          company,
          location
        ),
        profiles:user_id (
          name,
          email,
          skills,
          experience_years,
          location,
          bio
        )
      `)
      .order('applied_date', { ascending: false });

    if (error) {
      console.error('Error fetching applications for HR:', error);
      throw error;
    }

    return data || [];
  },

  async scheduleInterview(applicationId: string, interviewData: {
    stage: string;
    scheduled_date: string;
    scheduled_time: string;
    interviewer_id?: string;
    location?: string;
    meeting_link?: string;
  }) {
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        application_id: applicationId,
        ...interviewData
      })
      .select()
      .single();

    if (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }

    // Update application with next interview details
    await this.updateApplicationStatus(applicationId, {
      next_interview_date: interviewData.scheduled_date,
      next_interview_time: interviewData.scheduled_time,
      next_interview_stage: interviewData.stage
    });

    return data;
  }
};
