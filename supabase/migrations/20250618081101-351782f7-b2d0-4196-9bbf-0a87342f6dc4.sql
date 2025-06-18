
-- Add job_category enum to categorize jobs as technical or non-technical
CREATE TYPE public.job_category AS ENUM ('technical', 'non_technical');

-- Add job_category column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_category job_category DEFAULT 'technical';

-- Add level field to better categorize applicant levels
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS applicant_level text;

-- Update RLS policies for jobs to allow HR to insert jobs
DROP POLICY IF EXISTS "HR can create jobs" ON public.jobs;
CREATE POLICY "HR can create jobs" ON public.jobs 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'hr')
);

-- Allow HR to update jobs they created
DROP POLICY IF EXISTS "HR can update their own jobs" ON public.jobs;
CREATE POLICY "HR can update their own jobs" ON public.jobs 
FOR UPDATE USING (
  posted_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'hr')
);

-- Allow everyone to view active jobs (both technical and non-technical)
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs" ON public.jobs 
FOR SELECT USING (is_active = true);
