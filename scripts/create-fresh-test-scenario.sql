-- Alternative: Create a completely fresh test scenario
-- This creates new test data you can use instead

DO $$
BEGIN
    RAISE NOTICE 'Creating fresh test scenario...';
    
    -- You can test with these fresh email addresses instead:
    RAISE NOTICE 'For testing, you can create new accounts with these emails:';
    RAISE NOTICE '1. test1@vitalsup.com';
    RAISE NOTICE '2. test2@vitalsup.com'; 
    RAISE NOTICE '3. demo@vitalsup.com';
    
    RAISE NOTICE 'These will be completely fresh and go through the full signup flow.';
    RAISE NOTICE 'Or run the reset script above to reset your existing accounts.';
    
END $$;
