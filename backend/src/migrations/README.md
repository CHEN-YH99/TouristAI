# Database Migrations

This directory contains TypeORM migrations for the TouristAI backend.

## Migration: AddSessionIndexesAndConstraints

**File:** `1737000000000-AddSessionIndexesAndConstraints.ts`

### Purpose

This migration adds performance optimization indexes and verifies cascade delete constraints for the conversation history management feature.

### Changes

1. **Composite Index on chat_sessions (user_id, updated_at)**
   - Optimizes session list queries by user and update time
   - Supports requirement 8.1: Return session list within 500ms

2. **Full-Text Search Index on chat_sessions.title**
   - Enables Chinese full-text search on session titles
   - Uses PostgreSQL GIN index with `to_tsvector('chinese', title)`
   - Supports requirements 5.2 and 5.3: Search sessions by title

3. **Full-Text Search Index on chat_messages.content**
   - Enables Chinese full-text search on message content
   - Uses PostgreSQL GIN index with `to_tsvector('chinese', content)`
   - Supports requirements 5.2 and 8.5: Search messages and accelerate search operations

4. **Cascade Delete Verification**
   - Verifies that cascade delete constraints exist (already defined in init.sql)
   - Ensures deleting a session automatically deletes all associated messages
   - Supports requirement 4.3: Cascade delete sessions and messages

### Requirements Validated

- **7.1**: Save messages immediately to PostgreSQL database
- **7.2**: Record sender, content, timestamp, and session ID for each message
- **7.3**: Use database transactions to ensure atomicity of message saving
- **8.1**: Return session list first page within 500ms (requires index optimization)

### Running the Migration

#### Development Environment

```bash
# Install dependencies (if not already installed)
npm install

# Run the migration
npm run migration:run
```

#### Production Environment

```bash
# Run the migration
npm run migration:run
```

### Verifying the Migration

After running the migration, you can verify the indexes were created:

```sql
-- Check indexes on chat_sessions
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'chat_sessions';

-- Check indexes on chat_messages
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'chat_messages';

-- Test full-text search on titles
SELECT * FROM chat_sessions 
WHERE to_tsvector('chinese', title) @@ to_tsquery('chinese', '旅游');

-- Test full-text search on messages
SELECT * FROM chat_messages 
WHERE to_tsvector('chinese', content) @@ to_tsquery('chinese', '巴黎');
```

### Rollback

If you need to rollback this migration:

```bash
npm run migration:revert
```

This will drop all the indexes created by this migration.

### Notes

- The cascade delete constraint (ON DELETE CASCADE) was already defined in the initial schema (init.sql), so this migration only verifies its existence
- The Chinese full-text search requires PostgreSQL's built-in Chinese text search configuration
- Make sure your PostgreSQL database has the necessary text search dictionaries installed
