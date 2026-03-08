import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  username: string

  @Column()
  password: string

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ default: 'free' })
  membershipType: string

  @Column({ type: 'timestamp', nullable: true })
  membershipExpiresAt: Date

  @Column({ default: 5 })
  dailyQuota: number

  @Column({ default: 0 })
  usedQuota: number

  @Column({ type: 'timestamp', nullable: true })
  quotaResetAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
