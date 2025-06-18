
-- 1. Fix foreign key constraint that prevents user deletion
-- First, let's modify the profiles table to use CASCADE on delete
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user categorization with proper enum
CREATE TYPE public.user_type AS ENUM ('hr', 'job_seeker');

-- Add user_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type user_type DEFAULT 'job_seeker';

-- 3. Fix application_stages foreign key to cascade properly
ALTER TABLE public.application_stages 
DROP CONSTRAINT IF EXISTS application_stages_application_id_fkey;

ALTER TABLE public.application_stages 
ADD CONSTRAINT application_stages_application_id_fkey 
FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;

-- 4. Add RLS policies for application_stages
DROP POLICY IF EXISTS "Users can view their own application stages" ON public.application_stages;
DROP POLICY IF EXISTS "HR can view all application stages" ON public.application_stages;

CREATE POLICY "Users can view their own application stages" ON public.application_stages
FOR SELECT USING (
  application_id IN (
    SELECT id FROM public.applications WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own application stages" ON public.application_stages
FOR UPDATE USING (
  application_id IN (
    SELECT id FROM public.applications WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can view all application stages" ON public.application_stages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'hr'
  )
);

-- 5. Update existing HR users
UPDATE public.profiles 
SET user_type = 'hr' 
WHERE role = 'hr';

-- 6. Fix magic link configuration by ensuring proper email confirmation settings
-- This will be handled in the auth configuration
