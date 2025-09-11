-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Set up monthly cron job to generate templates automatically  
-- This will run on the 1st of every month at 00:01 UTC
SELECT cron.schedule(
  'generate-monthly-templates',
  '1 0 1 * *', -- minute hour day month day_of_week
  $$
  SELECT
    net.http_post(
        url:='https://dzrlrfkidaahceryoajc.supabase.co/functions/v1/generate-monthly-templates',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cmxyZmtpZGFhaGNlcnlvYWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTQxNjYsImV4cCI6MjA2NTU3MDE2Nn0.P2XkHw_ASQYSjb3LaGMLcwKBpikLnPKa-M2AMLyl45c"}'::jsonb,
        body:=concat('{"scheduled": true, "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Also set up a cron job to activate the newly generated templates
-- This runs 10 minutes after generation to allow processing time
SELECT cron.schedule(
  'rotate-monthly-templates', 
  '11 0 1 * *', -- 10 minutes after generation
  $$
  SELECT public.rotate_monthly_templates(
    to_char(date_trunc('month', now()), 'YYYY-MM')
  );
  $$
);