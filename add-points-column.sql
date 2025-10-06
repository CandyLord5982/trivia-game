-- Add points column to user_answers table
-- Run this in your Supabase SQL editor

ALTER TABLE user_answers
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10;

-- Add comment to explain the column
COMMENT ON COLUMN user_answers.points IS 'Points earned for this answer (including racing bonus)';
