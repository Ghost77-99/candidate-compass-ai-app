import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  job_category: 'technical' | 'non_technical';
  applicant_level?: string;
  salary_min?: number;
  salary_max?: number;
  required_skills?: string[];
  posted_date: string;
  is_active: boolean;
  posted_by?: string;
  application_deadline?: string;
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
  current_stage: string;
  qualification_score: number;
  resume_summary?: string;
}

export const jobsService = {
  async getActiveJobs() {
    try {
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
    } catch (error) {
      console.error('Error in getActiveJobs:', error);
      throw error;
    }
  },

  async getUserApplications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            title,
            company,
            location
          )
        `)
        .eq('user_id', userId)
        .order('applied_date', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserApplications:', error);
      throw error;
    }
  },

  async applyToJob(jobId: string, userId: string, coverLetter?: string) {
    try {
      console.log('Applying to job:', { jobId, userId, coverLetter });

      // Check if user has already applied to this job
      const { data: existingApplication, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing application:', checkError);
        throw checkError;
      }

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      // Create new application
      const applicationData = {
        job_id: jobId,
        user_id: userId,
        status: 'applied' as const,
        progress_percentage: 10,
        current_stage: 'resume_upload',
        qualification_score: 0,
        cover_letter: coverLetter || null,
        applied_date: new Date().toISOString().split('T')[0]
      };

      console.log('Creating application with data:', applicationData);

      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select(`
          *,
          jobs:job_id (
            title,
            company,
            location
          )
        `)
        .single();

      if (error) {
        console.error('Error creating application:', error);
        throw error;
      }

      console.log('Application created successfully:', data);

      // Initialize application stages
      await this.initializeApplicationStages(data.id);

      return data;
    } catch (error) {
      console.error('Error in applyToJob:', error);
      throw error;
    }
  },

  async initializeApplicationStages(applicationId: string) {
    try {
      const stages = [
        'resume_upload',
        'aptitude_test',
        'group_discussion',
        'technical_test',
        'hr_round',
        'personality_test'
      ];

      const stageData = stages.map(stageName => ({
        application_id: applicationId,
        stage_name: stageName,
        status: 'pending' as const,
        score: 0
      }));

      const { error } = await supabase
        .from('application_stages')
        .insert(stageData);

      if (error) {
        console.error('Error initializing stages:', error);
        throw error;
      }

      console.log('Application stages initialized successfully');
    } catch (error) {
      console.error('Error in initializeApplicationStages:', error);
      throw error;
    }
  }
};