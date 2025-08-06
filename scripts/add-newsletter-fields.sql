-- Add newsletter customization fields to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS newsletter_name TEXT DEFAULT 'An Apple a Day',
ADD COLUMN IF NOT EXISTS newsletter_background_color TEXT DEFAULT 'soft-blue',
ADD COLUMN IF NOT EXISTS headshot_url TEXT,
ADD COLUMN IF NOT EXISTS newsletter_welcome_message TEXT DEFAULT '👋 Hello and welcome to this week''s "An Apple a Day" — your trusted guide to staying happy and healthy.',
ADD COLUMN IF NOT EXISTS sender_email TEXT,
ADD COLUMN IF NOT EXISTS custom_sender_domain BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sending_frequency TEXT DEFAULT 'bi-weekly';

-- Create storage bucket for doctor images if it doesn't exist
-- Note: This requires appropriate Supabase permissions
-- You may need to create this bucket manually in the Supabase dashboard
