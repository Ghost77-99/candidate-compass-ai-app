
import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  salary_min?: number;
  salary_max?: number;
  required_skills?: string[];
  posted_date: string;
  is_active: boolean;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: 'applied' | 'aptitude_test' | 'group_discussion' | 'technical_test' | 'hr_round' | 'completed' | 'rejected';
  applied_date: string;
  progress_percentage: number;
  next_interview_date?: string;
  next_interview_time?: string;
  next_interview_stage?: string;
  cover_letter?: string;
  notes?: string;
}

export const jobsService = {
  async getActiveJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('posted_date', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    return data as Job[];
  },

  async getUserApplications(userId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id (
          title,
          company
        )
      `)
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    return data;
  },

  async applyToJob(jobId: string, userId: string, coverLetter?: string) {
    // Check if user has already applied to this job
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        user_id: userId,
        status: 'applied',
        progress_percentage: 10,
        cover_letter: coverLetter
      })
      .select()
      .single();

    if (error) {
      console.error('Error applying to job:', error);
      throw error;
    }

    return data;
  }
};
