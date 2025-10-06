-- Fix RLS policies for user_answers table so everyone can see all answers
-- Run this in your Supabase SQL editor

-- First, check existing policies
SELECT * FROM pg_policies WHERE tablename = 'user_answers';

-- Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;

-- Create policy: Everyone can read ALL answers (for real-time competition view)
CREATE POLICY "Anyone can view all answers"
  ON user_answers
  FOR SELECT
  USING (true);

-- Create policy: Users can only insert their own answers
CREATE POLICY "Users can insert their own answers"
  ON user_answers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Verify the new policies
SELECT * FROM pg_policies WHERE tablename = 'user_answers';
