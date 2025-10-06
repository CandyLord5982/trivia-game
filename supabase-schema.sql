-- Create scores table
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for leaderboard queries
CREATE INDEX idx_scores_score_desc ON scores(score DESC, created_at ASC);
CREATE INDEX idx_scores_user_id ON scores(user_id);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read scores
CREATE POLICY "Allow public read access" ON scores
  FOR SELECT USING (true);

-- Policy to allow authenticated users to insert their own scores
CREATE POLICY "Allow authenticated users to insert scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
