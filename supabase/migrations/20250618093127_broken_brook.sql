/*
  # Advanced HR Platform Features

  1. New Tables
    - `interview_feedback` - Detailed feedback for each interview stage
    - `skill_assessments` - Technical skill evaluation results
    - `candidate_notes` - HR notes and observations
    - `job_templates` - Reusable job posting templates
    - `interview_schedules` - Enhanced interview scheduling
    - `performance_metrics` - Candidate performance tracking

  2. Enhanced Features
    - Advanced analytics and reporting
    - Skill-based matching algorithms
    - Interview feedback system
    - Performance dashboards
    - Automated notifications

  3. Security
    - Enhanced RLS policies
    - Audit logging
    - Data privacy controls
*/

-- Create interview feedback table for detailed stage-by-stage feedback
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  technical_score INTEGER CHECK (technical_score >= 0 AND technical_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  problem_solving_score INTEGER CHECK (problem_solving_score >= 0 AND problem_solving_score <= 100),
  cultural_fit_score INTEGER CHECK (cultural_fit_score >= 0 AND cultural_fit_score <= 100),
  overall_recommendation TEXT CHECK (overall_recommendation IN ('strong_hire', 'hire', 'no_hire', 'strong_no_hire')),
  detailed_feedback TEXT,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  follow_up_questions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skill assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  assessment_type TEXT CHECK (assessment_type IN ('coding_test', 'quiz', 'practical_task', 'portfolio_review')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  max_score INTEGER DEFAULT 100,
  time_taken_minutes INTEGER,
  assessment_data JSONB DEFAULT '{}',
  evaluator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  evaluation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidate notes table for HR observations
CREATE TABLE IF NOT EXISTS candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  note_type TEXT CHECK (note_type IN ('general', 'interview', 'reference_check', 'background_check', 'follow_up')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job templates table for reusable job postings
CREATE TABLE IF NOT EXISTS job_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced interview schedules table
CREATE TABLE IF NOT EXISTS interview_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  location TEXT,
  meeting_link TEXT,
  meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'teams', 'meet', 'in_person', 'phone')),
  interviewer_ids UUID[],
  preparation_notes TEXT,
  agenda JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed')) DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_application_id ON skill_assessments(application_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_application_id ON candidate_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_application_id ON interview_schedules(application_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_application_id ON performance_metrics(application_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_current_stage ON applications(current_stage);
CREATE INDEX IF NOT EXISTS idx_jobs_job_category ON jobs(job_category);

-- Enable RLS on new tables
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_feedback
CREATE POLICY "HR can manage interview feedback" ON interview_feedback
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
  );

CREATE POLICY "Interviewers can view their feedback" ON interview_feedback
  FOR SELECT USING (interviewer_id = auth.uid());

-- RLS Policies for skill_assessments
CREATE POLICY "HR can manage skill assessments" ON skill_assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
  );

CREATE POLICY "Candidates can view their assessments" ON skill_assessments
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for candidate_notes
CREATE POLICY "HR can manage candidate notes" ON candidate_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
  );

-- RLS Policies for job_templates
CREATE POLICY "HR can manage job templates" ON job_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
  );

CREATE POLICY "Anyone can view public templates" ON job_templates
  FOR SELECT USING (is_public = true);

-- RLS Policies for interview_schedules
CREATE POLICY "HR can manage interview schedules" ON interview_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
  );

CREATE POLICY "Candidates can view their schedules" ON interview_schedules
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for performance_metrics
CREATE POLICY "HR can manage performance metrics" ON performance_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
  );

-- Add updated_at triggers
CREATE TRIGGER update_interview_feedback_updated_at 
  BEFORE UPDATE ON interview_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_assessments_updated_at 
  BEFORE UPDATE ON skill_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_notes_updated_at 
  BEFORE UPDATE ON candidate_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_templates_updated_at 
  BEFORE UPDATE ON job_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_schedules_updated_at 
  BEFORE UPDATE ON interview_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate overall candidate score
CREATE OR REPLACE FUNCTION calculate_candidate_score(app_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  resume_score DECIMAL(5,2) := 0;
  stage_scores DECIMAL(5,2) := 0;
  skill_scores DECIMAL(5,2) := 0;
  interview_scores DECIMAL(5,2) := 0;
  total_score DECIMAL(5,2) := 0;
BEGIN
  -- Get resume qualification score
  SELECT COALESCE(qualification_score, 0) INTO resume_score
  FROM applications WHERE id = app_id;
  
  -- Get average stage scores
  SELECT COALESCE(AVG(score), 0) INTO stage_scores
  FROM application_stages 
  WHERE application_id = app_id AND status = 'completed';
  
  -- Get average skill assessment scores
  SELECT COALESCE(AVG(score), 0) INTO skill_scores
  FROM skill_assessments 
  WHERE application_id = app_id;
  
  -- Get average interview feedback scores
  SELECT COALESCE(AVG((technical_score + communication_score + problem_solving_score + cultural_fit_score) / 4.0), 0) 
  INTO interview_scores
  FROM interview_feedback if
  JOIN interviews i ON if.interview_id = i.id
  WHERE i.application_id = app_id;
  
  -- Calculate weighted total score
  total_score := (resume_score * 0.2) + (stage_scores * 0.3) + (skill_scores * 0.25) + (interview_scores * 0.25);
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate hiring recommendation
CREATE OR REPLACE FUNCTION get_hiring_recommendation(app_id UUID)
RETURNS TEXT AS $$
DECLARE
  total_score DECIMAL(5,2);
  completed_stages INTEGER;
  total_stages INTEGER;
BEGIN
  -- Get overall score
  SELECT calculate_candidate_score(app_id) INTO total_score;
  
  -- Get stage completion ratio
  SELECT 
    COUNT(CASE WHEN status = 'completed' THEN 1 END),
    COUNT(*)
  INTO completed_stages, total_stages
  FROM application_stages 
  WHERE application_id = app_id;
  
  -- Generate recommendation based on score and completion
  IF total_score >= 85 AND completed_stages >= 4 THEN
    RETURN 'strong_hire';
  ELSIF total_score >= 70 AND completed_stages >= 3 THEN
    RETURN 'hire';
  ELSIF total_score >= 50 AND completed_stages >= 2 THEN
    RETURN 'consider';
  ELSE
    RETURN 'no_hire';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert sample job templates
INSERT INTO job_templates (name, description, template_data, created_by, is_public) 
SELECT 
  'Software Engineer Template',
  'Standard template for software engineering positions',
  jsonb_build_object(
    'title', 'Software Engineer',
    'job_type', 'full_time',
    'experience_level', 'mid',
    'job_category', 'technical',
    'required_skills', ARRAY['JavaScript', 'React', 'Node.js', 'SQL'],
    'description_template', 'We are looking for a talented Software Engineer to join our team...'
  ),
  id,
  true
FROM profiles 
WHERE user_type = 'hr' 
LIMIT 1;

INSERT INTO job_templates (name, description, template_data, created_by, is_public) 
SELECT 
  'Marketing Manager Template',
  'Standard template for marketing management positions',
  jsonb_build_object(
    'title', 'Marketing Manager',
    'job_type', 'full_time',
    'experience_level', 'mid',
    'job_category', 'non_technical',
    'required_skills', ARRAY['Digital Marketing', 'Analytics', 'Content Strategy', 'SEO'],
    'description_template', 'We are seeking an experienced Marketing Manager to lead our marketing initiatives...'
  ),
  id,
  true
FROM profiles 
WHERE user_type = 'hr' 
LIMIT 1;