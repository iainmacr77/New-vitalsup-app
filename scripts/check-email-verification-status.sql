-- Check recent user signups and their email confirmation status
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmation_token,
    created_at,
    updated_at,
    raw_user_meta_data
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Check if there are any pending email confirmations
SELECT 
    id,
    email,
    email_confirmed_at IS NULL as needs_confirmation,
    confirmation_token IS NOT NULL as has_token,
    created_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
