
-- Enable password-based authentication in Supabase
-- This is handled through Supabase dashboard settings, but we can create a function to handle password resets with OTP

-- Create a table to store OTP codes for password reset
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Create policy for the password reset OTPs (no user-based access since users aren't logged in during reset)
CREATE POLICY "Allow insert for password reset OTPs" 
  ON public.password_reset_otps 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow select for password reset OTPs" 
  ON public.password_reset_otps 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow update for password reset OTPs" 
  ON public.password_reset_otps 
  FOR UPDATE 
  USING (true);

-- Create an edge function to generate and send OTP for password reset
CREATE OR REPLACE FUNCTION generate_password_reset_otp(user_email TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp_code TEXT;
BEGIN
  -- Generate 6-digit OTP
  otp_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Insert OTP into table
  INSERT INTO public.password_reset_otps (email, otp_code)
  VALUES (user_email, otp_code);
  
  -- Note: In a real implementation, you'd send the OTP via email here
  -- For now, we'll return success and the calling function will handle email sending
  
  RETURN QUERY SELECT true as success, 'OTP generated successfully' as message;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false as success, SQLERRM as message;
END;
$$;

-- Create function to verify OTP and allow password reset
CREATE OR REPLACE FUNCTION verify_password_reset_otp(user_email TEXT, provided_otp TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp_record RECORD;
BEGIN
  -- Find valid OTP
  SELECT * INTO otp_record
  FROM public.password_reset_otps
  WHERE email = user_email 
    AND otp_code = provided_otp 
    AND expires_at > now() 
    AND used = FALSE
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF otp_record IS NULL THEN
    RETURN QUERY SELECT false as success, 'Invalid or expired OTP' as message;
    RETURN;
  END IF;
  
  -- Mark OTP as used
  UPDATE public.password_reset_otps
  SET used = TRUE
  WHERE id = otp_record.id;
  
  RETURN QUERY SELECT true as success, 'OTP verified successfully' as message;
END;
$$;
