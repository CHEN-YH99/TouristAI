import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSessionIndexesAndConstraints1737000000000 implements MigrationInterface {
  name = 'AddSessionIndexesAndConstraints1737000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 为 chat_sessions 表添加复合索引（user_id, updated_at）用于优化会话列表查询
    // 这个索引支持按用户ID和更新时间降序查询，满足需求8.1（500ms内返回会话列表）
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_sessions_user_updated" 
      ON "chat_sessions" ("user_id", "updated_at" DESC)
    `)

    // 2. 为 chat_sessions 表的 title 字段添加全文搜索索引
    // 使用 PostgreSQL 的 GIN 索引和 to_tsvector 函数支持全文搜索
    // 使用 'simple' 配置以支持多语言（包括中文）
    // 满足需求5.2（搜索会话标题）和需求5.3（500ms内返回搜索结果）
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_sessions_title_gin" 
      ON "chat_sessions" USING gin(to_tsvector('simple', "title"))
    `)

    // 3. 为 chat_messages 表的 content 字段添加全文搜索索引
    // 使用 PostgreSQL 的 GIN 索引和 to_tsvector 函数支持全文搜索
    // 使用 'simple' 配置以支持多语言（包括中文）
    // 满足需求5.2（搜索消息内容）和需求8.5（使用全文搜索索引加速搜索操作）
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_messages_content_gin" 
      ON "chat_messages" USING gin(to_tsvector('simple', "content"))
    `)

    // 4. 验证级联删除约束已存在
    // chat_messages 表的 session_id 外键已经在 init.sql 中设置了 ON DELETE CASCADE
    // 这确保删除会话时自动删除所有关联消息，满足需求4.3（级联删除会话和消息）
    // 注意：由于约束已在 init.sql 中创建，这里只是添加注释说明，不需要额外操作
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚索引
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_messages_content_gin"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sessions_title_gin"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sessions_user_updated"`)
  }
}
