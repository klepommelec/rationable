-- Fix RLS policies for public.profiles table
-- This script ensures that authenticated users can view profile information
-- necessary for displaying avatars and names.

-- 1. Drop existing policies on profiles (if any, to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view public profiles." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- 2. Create a policy to allow authenticated users to view all profiles
-- This is generally needed for features like displaying avatars of other users.
CREATE POLICY "Allow authenticated users to view all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. Create a policy to allow users to update their own profile
-- This is good practice if users can edit their avatar or name.
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- 4. Create a policy to allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Add function to get recent voters with profile info
-- This function explicitly joins decision_votes with profiles via auth.users
CREATE OR REPLACE FUNCTION public.get_recent_voters_with_profiles(
    decision_id_param TEXT,
    option_name_param TEXT,
    limit_param INT DEFAULT 3
)
RETURNS TABLE(
    user_id UUID,
    avatar_url TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dv.user_id,
        p.avatar_url,
        p.full_name,
        dv.created_at
    FROM
        public.decision_votes dv
    JOIN
        auth.users au ON dv.user_id = au.id
    LEFT JOIN
        public.profiles p ON au.id = p.id
    WHERE
        dv.decision_id = decision_id_param AND dv.option_name = option_name_param
    ORDER BY
        dv.created_at DESC
    LIMIT limit_param;
END;
$$;

-- 7. Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_recent_voters_with_profiles(TEXT, TEXT, INT) TO authenticated;

-- 8. Ensure the profiles table has the required columns
-- If these columns don't exist, create them
DO $$
BEGIN
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;
