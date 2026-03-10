import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm'
import { User } from '../../user/user.entity'
import { ChatMessage } from './chat-message.entity'

@Entity('chat_sessions')
@Index('idx_chat_sessions_user_id', ['userId'])
@Index('idx_chat_sessions_created_at', ['createdAt'])
@Index('idx_sessions_user_updated', ['userId', 'updatedAt'])
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string

  @OneToMany(() => ChatMessage, message => message.session)
  messages: ChatMessage[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
