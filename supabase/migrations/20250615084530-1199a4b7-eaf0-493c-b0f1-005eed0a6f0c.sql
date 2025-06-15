
-- Add Row Level Security policies for the applications table
-- Allow authenticated users to view all applications (for HR dashboard)
CREATE POLICY "Allow authenticated users to view applications" 
  ON public.applications 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow authenticated users to insert applications (for job applications)
CREATE POLICY "Allow authenticated users to create applications" 
  ON public.applications 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update applications (for HR to update status)
CREATE POLICY "Allow authenticated users to update applications" 
  ON public.applications 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Add RLS policies for the interviews table as well
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view interviews" 
  ON public.interviews 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create interviews" 
  ON public.interviews 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update interviews" 
  ON public.interviews 
  FOR UPDATE 
  TO authenticated
  USING (true);
