-- Test index functionality
-- Create test data for index verification
INSERT INTO users (id, email, username, password, "createdAt", "updatedAt") 
VALUES (
  '123e4567-e89b-12d3-a456-426614174001',
  'indextest@example.com',
  'indextest',
  'hashed_password',
  NOW(),
  NOW()
);

-- Create multiple test sessions with different titles and update times
INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at)
VALUES 
  ('223e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', 'Paris Travel Guide', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
  ('223e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174001', 'Tokyo Cherry Blossom Trip', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'),
  ('223e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174001', 'New York Food Recommendations', NOW() - INTERVAL '30 minutes', NOW());

-- Create test messages with searchable content
INSERT INTO chat_messages (id, session_id, role, content, created_at)
VALUES 
  ('323e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'user', 'I want to travel to Paris, please help me create a detailed guide', NOW()),
  ('323e4567-e89b-12d3-a456-426614174002', '223e4567-e89b-12d3-a456-426614174001', 'assistant', 'Paris is a beautiful city with many famous attractions like the Eiffel Tower', NOW()),
  ('323e4567-e89b-12d3-a456-426614174003', '223e4567-e89b-12d3-a456-426614174002', 'user', 'What places do you recommend for cherry blossom season in Tokyo?', NOW()),
  ('323e4567-e89b-12d3-a456-426614174004', '223e4567-e89b-12d3-a456-426614174002', 'assistant', 'Tokyo cherry blossom season is beautiful, I recommend Ueno Park and Shinjuku Gyoen', NOW()),
  ('323e4567-e89b-12d3-a456-426614174005', '223e4567-e89b-12d3-a456-426614174003', 'user', 'What good food recommendations are there in New York?', NOW());

-- Test 1: Verify sessions are ordered by updated_at DESC (using the composite index)
SELECT 'Test 1 - Sessions ordered by updated_at DESC:' as test;
SELECT title, updated_at FROM chat_sessions 
WHERE user_id = '123e4567-e89b-12d3-a456-426614174001' 
ORDER BY updated_at DESC;

-- Test 2: Test full-text search on session titles (using GIN index)
SELECT 'Test 2 - Search sessions by title (Paris):' as test;
SELECT title FROM chat_sessions 
WHERE to_tsvector('simple', title) @@ to_tsquery('simple', 'Paris');

-- Test 3: Test full-text search on message content (using GIN index)
SELECT 'Test 3 - Search messages by content (cherry):' as test;
SELECT content FROM chat_messages 
WHERE to_tsvector('simple', content) @@ to_tsquery('simple', 'cherry');

-- Test 4: Test combined search (title OR content contains keyword)
SELECT 'Test 4 - Combined search for Tokyo:' as test;
SELECT DISTINCT s.title 
FROM chat_sessions s
LEFT JOIN chat_messages m ON s.id = m.session_id
WHERE to_tsvector('simple', s.title) @@ to_tsquery('simple', 'Tokyo')
   OR to_tsvector('simple', m.content) @@ to_tsquery('simple', 'Tokyo');