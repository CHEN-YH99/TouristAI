import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('guides')
export class Guide {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column({ nullable: true })
  sessionId: string

  @Column()
  title: string

  @Column('text')
  content: string

  @Column({ nullable: true })
  destination: string

  @Column({ nullable: true })
  days: number

  @Column('decimal', { nullable: true })
  budget: number

  @Column('simple-array', { default: '' })
  tags: string[]

  @Column({ default: false })
  isPublic: boolean

  @Column({ default: 0 })
  viewCount: number

  @Column({ default: 0 })
  likeCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
