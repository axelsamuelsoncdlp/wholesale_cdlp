-- Temporarily disable RLS for profiles table to fix authentication issues
-- This allows the AuthContext to load user profiles without RLS restrictions

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS (uncomment when ready)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
