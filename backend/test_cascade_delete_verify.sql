-- Test cascade delete functionality
-- First, verify the data exists
SELECT 'Before delete - Sessions:' as info, COUNT(*) as count FROM chat_sessions WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
UNION ALL
SELECT 'Before delete - Messages:' as info, COUNT(*) as count FROM chat_messages WHERE session_id = '223e4567-e89b-12d3-a456-426614174000';

-- Delete the session (this should cascade delete all messages)
DELETE FROM chat_sessions WHERE id = '223e4567-e89b-12d3-a456-426614174000';

-- Verify cascade delete worked
SELECT 'After delete - Sessions:' as info, COUNT(*) as count FROM chat_sessions WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
UNION ALL
SELECT 'After delete - Messages:' as info, COUNT(*) as count FROM chat_messages WHERE session_id = '223e4567-e89b-12d3-a456-426614174000';

-- Clean up test user
DELETE FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';