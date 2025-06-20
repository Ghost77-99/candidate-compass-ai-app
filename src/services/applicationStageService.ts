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
    try {
      const { data, error } = await supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching application stages:', error);
        throw error;
      }

      return (data || []) as ApplicationStage[];
    } catch (error) {
      console.error('Error in getApplicationStages:', error);
      throw error;
    }
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
    try {
      console.log(`Updating stage ${stageName} for application ${applicationId}:`, updates);

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // First, try to update existing stage
      const { data: existingStage, error: fetchError } = await supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', applicationId)
        .eq('stage_name', stageName)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing stage:', fetchError);
        throw fetchError;
      }

      let data;
      let error;

      if (existingStage) {
        // Update existing stage
        const result = await supabase
          .from('application_stages')
          .update(updateData)
          .eq('application_id', applicationId)
          .eq('stage_name', stageName)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Create new stage
        const result = await supabase
          .from('application_stages')
          .insert({
            application_id: applicationId,
            stage_name: stageName,
            ...updateData
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error updating stage status:', error);
        throw error;
      }

      // Update current stage in applications table if this stage is completed
      if (updates.status === 'completed') {
        await this.updateApplicationProgress(applicationId, stageName);
      }

      console.log('Stage updated successfully:', data);
      return data as ApplicationStage;
    } catch (error) {
      console.error('Error in updateStageStatus:', error);
      throw error;
    }
  },

  async updateApplicationProgress(applicationId: string, completedStageName: string) {
    try {
      const stageOrder = [
        'resume_upload', 'aptitude_test', 'group_discussion',
        'technical_test', 'hr_round', 'personality_test'
      ];
      
      const currentIndex = stageOrder.indexOf(completedStageName);
      const nextStage = stageOrder[currentIndex + 1];

      // Calculate progress percentage
      const completedStages = currentIndex + 1;
      const progressPercentage = Math.round((completedStages / stageOrder.length) * 100);

      // Determine application status
      let applicationStatus = 'applied';
      if (completedStageName === 'aptitude_test') applicationStatus = 'aptitude_test';
      else if (completedStageName === 'group_discussion') applicationStatus = 'group_discussion';
      else if (completedStageName === 'technical_test') applicationStatus = 'technical_test';
      else if (completedStageName === 'hr_round') applicationStatus = 'hr_round';
      else if (completedStageName === 'personality_test') applicationStatus = 'completed';

      const updateData = {
        current_stage: nextStage || 'completed',
        progress_percentage: progressPercentage,
        status: applicationStatus,
        updated_at: new Date().toISOString()
      };

      console.log('Updating application progress:', updateData);

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application progress:', error);
        throw error;
      }

      console.log('Application progress updated successfully');
    } catch (error) {
      console.error('Error in updateApplicationProgress:', error);
      throw error;
    }
  },

  async completeResumeStage(
    applicationId: string,
    resumeUrl: string,
    qualificationScore: number,
    resumeSummary: string
  ): Promise<void> {
    try {
      const isPassed = qualificationScore >= 75;
      
      // Update the resume upload stage
      await this.updateStageStatus(applicationId, 'resume_upload', {
        status: isPassed ? 'completed' : 'failed',
        score: qualificationScore,
        feedback: `Resume uploaded with qualification score: ${qualificationScore}%`
      });

      // Update application with resume data
      const { error } = await supabase
        .from('applications')
        .update({
          qualification_score: qualificationScore,
          resume_summary: resumeSummary,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application with resume data:', error);
        throw error;
      }

      console.log('Resume stage completed successfully');
    } catch (error) {
      console.error('Error in completeResumeStage:', error);
      throw error;
    }
  }
};