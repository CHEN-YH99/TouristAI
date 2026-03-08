import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Guide } from './guide.entity'

/**
 * 攻略服务
 * 处理攻略的CRUD操作
 */
@Injectable()
export class GuideService {
  constructor(
    @InjectRepository(Guide)
    private guideRepository: Repository<Guide>,
  ) {}

  /**
   * 创建攻略
   * @param guideData 攻略数据
   * @returns 创建的攻略
   */
  async create(guideData: Partial<Guide>): Promise<Guide> {
    const guide = this.guideRepository.create({
      ...guideData,
      viewCount: 0,
      likeCount: 0,
      isPublic: false,
    })
    return this.guideRepository.save(guide)
  }

  /**
   * 根据用户ID查询攻略列表
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 攻略列表
   */
  async findByUserId(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ data: Guide[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.guideRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { data, total, page, limit }
  }

  /**
   * 根据ID查询攻略
   * @param id 攻略ID
   * @returns 攻略详情
   */
  async findById(id: string): Promise<Guide> {
    const guide = await this.guideRepository.findOne({ where: { id } })
    if (!guide) {
      throw new NotFoundException('攻略不存在')
    }
    return guide
  }

  /**
   * 更新攻略
   * @param id 攻略ID
   * @param userId 用户ID（用于权限验证）
   * @param guideData 更新数据
   * @returns 更新后的攻略
   */
  async update(id: string, userId: string, guideData: Partial<Guide>): Promise<Guide> {
    const guide = await this.findById(id)
    
    // 验证权限
    if (guide.userId !== userId) {
      throw new NotFoundException('无权修改此攻略')
    }

    await this.guideRepository.update(id, {
      ...guideData,
      updatedAt: new Date(),
    })
    
    return this.findById(id)
  }

  /**
   * 删除攻略
   * @param id 攻略ID
   * @param userId 用户ID（用于权限验证）
   */
  async delete(id: string, userId: string): Promise<void> {
    const guide = await this.findById(id)
    
    // 验证权限
    if (guide.userId !== userId) {
      throw new NotFoundException('无权删除此攻略')
    }

    await this.guideRepository.delete(id)
  }

  /**
   * 增加浏览次数
   * @param id 攻略ID
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.guideRepository.increment({ id }, 'viewCount', 1)
  }

  /**
   * 搜索攻略
   * @param keyword 关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 攻略列表
   */
  async search(
    keyword: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Guide[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.guideRepository
      .createQueryBuilder('guide')
      .where('guide.isPublic = :isPublic', { isPublic: true })
      .andWhere(
        '(guide.title LIKE :keyword OR guide.destination LIKE :keyword OR guide.content LIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
      .orderBy('guide.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await queryBuilder.getManyAndCount()

    return { data, total, page, limit }
  }
}
