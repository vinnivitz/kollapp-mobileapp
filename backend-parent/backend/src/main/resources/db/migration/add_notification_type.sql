-- Migration script to add notification_type support to push_notification table
-- Run this after deploying the updated backend code

-- Add notification_type column to push_notification table
ALTER TABLE push_notification 
ADD COLUMN notification_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL';

-- Optional: Categorize existing notifications based on title patterns
-- Uncomment and modify if you want to categorize existing data

-- UPDATE push_notification 
-- SET notification_type = 'ACTIVITY_NOTIFICATIONS' 
-- WHERE title LIKE '%Activity%' OR title LIKE '%Event%' OR title LIKE '%activity%';

-- UPDATE push_notification 
-- SET notification_type = 'ORGANIZATION_UPDATES' 
-- WHERE title LIKE '%Organization%' OR title LIKE '%Announcement%' OR title LIKE '%organization%';

-- UPDATE push_notification 
-- SET notification_type = 'FINANCIAL_UPDATES' 
-- WHERE title LIKE '%Payment%' OR title LIKE '%Budget%' OR title LIKE '%Posting%' OR title LIKE '%payment%';

-- UPDATE push_notification 
-- SET notification_type = 'MEMBERSHIP_UPDATES' 
-- WHERE title LIKE '%Membership%' OR title LIKE '%Approved%' OR title LIKE '%membership%';

-- UPDATE push_notification 
-- SET notification_type = 'DIRECT_MESSAGES' 
-- WHERE title LIKE '%Message%' OR title LIKE '%message%';

-- UPDATE push_notification 
-- SET notification_type = 'SYSTEM_ALERTS' 
-- WHERE title LIKE '%Alert%' OR title LIKE '%Warning%' OR title LIKE '%Error%';

-- Verify the migration
SELECT notification_type, COUNT(*) as count 
FROM push_notification 
GROUP BY notification_type;
