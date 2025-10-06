-- Enable Realtime for all tables
-- Run this in your Supabase SQL editor if you already created the tables

-- Enable realtime for user_paths table (for path locking)
ALTER PUBLICATION supabase_realtime ADD TABLE user_paths;

-- Enable realtime for user_answers table (for question progress updates)
ALTER PUBLICATION supabase_realtime ADD TABLE user_answers;

-- Verify realtime is enabled (optional - check the result)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
