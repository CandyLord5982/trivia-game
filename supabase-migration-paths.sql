-- Create user_paths table to track which path each player has chosen
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  path_number INTEGER NOT NULL CHECK (path_number >= 1 AND path_number <= 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(path_number)
);

-- Enable Row Level Security
ALTER TABLE user_paths ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all path selections
CREATE POLICY "Anyone can view paths"
  ON user_paths
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own path (only once)
CREATE POLICY "Users can select their path"
  ON user_paths
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_paths_user_id ON user_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_user_paths_path_number ON user_paths(path_number);

-- Enable Realtime for the table (IMPORTANT for real-time updates!)
ALTER PUBLICATION supabase_realtime ADD TABLE user_paths;
