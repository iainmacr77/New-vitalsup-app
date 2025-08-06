-- Add from email configuration fields to newsletter_profiles table
ALTER TABLE newsletter_profiles 
ADD COLUMN IF NOT EXISTS from_email_option TEXT DEFAULT 'vitalsup_default' CHECK (from_email_option IN ('vitalsup_default', 'custom_domain')),
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS custom_domain_status TEXT DEFAULT 'pending' CHECK (custom_domain_status IN ('pending', 'configured', 'failed')),
ADD COLUMN IF NOT EXISTS dns_host_provider TEXT,
ADD COLUMN IF NOT EXISTS setup_notes TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN newsletter_profiles.from_email_option IS 'Email option: vitalsup_default (noreply@vitalsup.co.za) or custom_domain';
COMMENT ON COLUMN newsletter_profiles.custom_domain IS 'Custom domain for noreply emails (e.g., capetownclinic.co.za)';
COMMENT ON COLUMN newsletter_profiles.custom_domain_status IS 'Status of custom domain setup: pending, configured, or failed';
COMMENT ON COLUMN newsletter_profiles.dns_host_provider IS 'DNS hosting provider for custom domain setup assistance';
COMMENT ON COLUMN newsletter_profiles.setup_notes IS 'Internal notes for custom domain setup';
