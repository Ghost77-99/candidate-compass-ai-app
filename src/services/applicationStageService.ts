
import { supabase } from '@/integrations/supabase/client';

export interface ApplicationStage {
  id: string;
  application_id: string;
  stage_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score: number;
  feedback: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const applicationStageService = {
  async getApplicationStages(applicationId: string): Promise<ApplicationStage[]> {
    const { data, error } = await supabase
      .from('application_stages')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching application stages:', error);
      throw error;
    }

    return data || [];
  },

  async updateStageStatus(
    applicationId: string,
    stageName: string,
    updates: {
      status?: 'pending' | 'in_progress' | 'completed' | 'failed';
      score?: number;
      feedback?: string;
    }
  ): Promise<ApplicationStage> {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('application_stages')
      .update(updateData)
      .eq('application_id', applicationId)
      .eq('stage_name', stageName)
      .select()
      .single();

    if (error) {
      console.error('Error updating stage status:', error);
      throw error;
    }

    // Update current stage in applications table if this stage is completed
    if (updates.status === 'completed') {
      const stageOrder = [
        'resume_upload', 'aptitude_test', 'group_discussion',
        'technical_test', 'hr_round', 'personality_test'
      ];
      const currentIndex = stageOrder.indexOf(stageName);
      const nextStage = stageOrder[currentIndex + 1];

      await supabase
        .from('applications')
        .update({
          current_stage: nextStage || 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
    }

    return data;
  },

  async completeResumeStage(
    applicationId: string,
    resumeUrl: string,
    qualificationScore: number,
    resumeSummary: string
  ): Promise<void> {
    const isPassed = qualificationScore >= 75;
    
    // Update the resume upload stage
    await this.updateStageStatus(applicationId, 'resume_upload', {
      status: isPassed ? 'completed' : 'failed',
      score: qualificationScore
    });

    // Update application with resume data
    await supabase
      .from('applications')
      .update({
        qualification_score: qualificationScore,
        resume_summary: resumeSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);
  }
};
