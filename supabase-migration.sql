-- Migration: Add user authentication to existing scores table

-- Add user_id column to existing scores table
ALTER TABLE scores ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow public insert access" ON scores;

-- Create new policy for authenticated users only
CREATE POLICY "Allow authenticated users to insert scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional: Make user_id required for new rows (uncomment if you want this)
-- ALTER TABLE scores ALTER COLUMN user_id SET NOT NULL;