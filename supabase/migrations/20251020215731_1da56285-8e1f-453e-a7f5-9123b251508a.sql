-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to cleanup old games
CREATE OR REPLACE FUNCTION cleanup_old_waiting_games()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete games in 'waiting' status that are older than 30 minutes
  DELETE FROM games
  WHERE status = 'waiting'
  AND created_at < NOW() - INTERVAL '30 minutes';
END;
$$;

-- Schedule the cleanup to run every 10 minutes
SELECT cron.schedule(
  'cleanup-old-games',
  '*/10 * * * *',
  $$
  SELECT cleanup_old_waiting_games();
  $$
);