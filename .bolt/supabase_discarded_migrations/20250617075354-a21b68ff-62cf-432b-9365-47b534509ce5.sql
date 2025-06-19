
-- Add stage tracking and qualification scoring to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) DEFAULT 'resume_upload';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS stage_data JSONB DEFAULT '{}';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS qualification_score INTEGER DEFAULT 0;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_summary TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS stage_completion_dates JSONB DEFAULT '{}';

-- Create a new table to track individual stage completions
CREATE TABLE IF NOT EXISTS application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  stage_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed
  score INTEGER DEFAULT 0,
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on application_stages
ALTER TABLE application_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for application_stages
CREATE POLICY "Users can view their own application stages" ON application_stages
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR can view all application stages" ON application_stages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for resumes bucket
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "HR can view all resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Add trigger to update updated_at column for application_stages
CREATE OR REPLACE TRIGGER update_application_stages_updated_at
  BEFORE UPDATE ON application_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to initialize application stages when application is created
CREATE OR REPLACE FUNCTION initialize_application_stages()
RETURNS TRIGGER AS $$
DECLARE
  stage_names TEXT[] := ARRAY['resume_upload', 'aptitude_test', 'group_discussion', 'technical_test', 'hr_round', 'personality_test'];
  stage_name TEXT;
BEGIN
  FOREACH stage_name IN ARRAY stage_names
  LOOP
    INSERT INTO application_stages (application_id, stage_name, status)
    VALUES (NEW.id, stage_name, CASE WHEN stage_name = 'resume_upload' THEN 'pending' ELSE 'pending' END);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize stages when application is created
DROP TRIGGER IF EXISTS trigger_initialize_application_stages ON applications;
CREATE TRIGGER trigger_initialize_application_stages
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION initialize_application_stages();
