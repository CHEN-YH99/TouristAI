import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } })
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData)
    return this.userRepository.save(user)
  }

  async checkAndResetQuota(userId: string): Promise<void> {
    const user = await this.findById(userId)
    if (!user) return

    const now = new Date()
    if (!user.quotaResetAt || now > user.quotaResetAt) {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      user.usedQuota = 0
      user.quotaResetAt = tomorrow
      await this.userRepository.save(user)
    }
  }

  async incrementQuota(userId: string): Promise<boolean> {
    await this.checkAndResetQuota(userId)
    
    const user = await this.findById(userId)
    if (!user || user.usedQuota >= user.dailyQuota) {
      return false
    }

    user.usedQuota += 1
    await this.userRepository.save(user)
    return true
  }
}
