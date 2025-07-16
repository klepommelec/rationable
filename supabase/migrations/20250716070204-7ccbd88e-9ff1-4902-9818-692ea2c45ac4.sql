-- Add use_context column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN use_context TEXT CHECK (use_context IN ('personal', 'professional')) DEFAULT 'personal';