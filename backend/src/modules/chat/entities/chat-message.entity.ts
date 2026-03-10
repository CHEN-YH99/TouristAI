import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { ChatSession } from './chat-session.entity'

@Entity('chat_messages')
@Index('idx_chat_messages_session_id', ['sessionId'])
@Index('idx_chat_messages_created_at', ['createdAt'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string

  @ManyToOne(() => ChatSession, session => session.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: ChatSession

  @Column({ type: 'varchar', length: 20 })
  role: 'user' | 'assistant' | 'system'

  @Column({ type: 'text' })
  content: string

  @Column({ name: 'tokens_used', type: 'integer', nullable: true })
  tokensUsed: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
