-- Test cascade delete functionality
-- Create a test user
INSERT INTO users (id, email, username, password, "createdAt", "updatedAt") 
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'test@example.com',
  'testuser',
  'hashed_password',
  NOW(),
  NOW()
);

-- Create a test session
INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at)
VALUES (
  '223e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Session for Migration Verification',
  NOW(),
  NOW()
);

-- Create test messages
INSERT INTO chat_messages (id, session_id, role, content, created_at)
VALUES 
  ('323e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', 'user', 'Hello, I want to test cascade delete', NOW()),
  ('423e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', 'assistant', 'This is a test response for cascade delete verification', NOW());

-- Verify data was created
SELECT 'Sessions created:' as info, COUNT(*) as count FROM chat_sessions WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
UNION ALL
SELECT 'Messages created:' as info, COUNT(*) as count FROM chat_messages WHERE session_id = '223e4567-e89b-12d3-a456-426614174000';