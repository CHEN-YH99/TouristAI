import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, Not, FindOptionsWhere } from 'typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Guide } from './guide.entity'

/**
 * 攻略服务（增强版）
 * 
 * 功能特性：
 * - 完整的CRUD操作
 * - 分页支持
 * - 全文搜索（标题、目的地、内容）
 * - 权限验证（只能操作自己的攻略）
 * - 浏览统计
 * - 排序功能（按时间、浏览量、点赞数）
 * - 软删除支持
 * - 查询缓存（Redis）
 */
@Injectable()
export class GuideService {
  private readonly CACHE_TTL = 300 // 5分钟缓存

  constructor(
    @InjectRepository(Guide)
    private guideRepository: Repository<Guide>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 验证攻略所有权
   * @param guideId 攻略ID
   * @param userId 用户ID
   * @throws ForbiddenException 如果用户无权操作
   */
  private async checkOwnership(guideId: string, userId: string): Promise<Guide> {
    const guide = await this.guideRepository.findOne({ 
      where: { id: guideId } 
    })
    
    if (!guide) {
      throw new NotFoundException('攻略不存在')
    }
    
    if (guide.userId !== userId) {
      throw new ForbiddenException('无权操作此攻略')
    }
    
    return guide
  }

  /**
   * 清除相关缓存
   * @param userId 用户ID
   */
  private async clearCache(userId: string): Promise<void> {
    const cacheKeys = [
      `guides:user:${userId}`,
      'guides:public',
      'guides:search'
    ]
    
    for (const key of cacheKeys) {
      await this.cacheManager.del(key)
    }
  }

  /**
   * 创建攻略
   * @param guideData 攻略数据
   * @returns 创建的攻略
   */
  async create(guideData: Partial<Guide>): Promise<Guide> {
    // 验证必填字段
    if (!guideData.title || !guideData.content) {
      throw new BadRequestException('标题和内容不能为空')
    }

    if (!guideData.userId) {
      throw new BadRequestException('用户ID不能为空')
    }

    const guide = this.guideRepository.create({
      ...guideData,
      viewCount: 0,
      likeCount: 0,
      isPublic: false,
    })
    
    const savedGuide = await this.guideRepository.save(guide)
    
    // 清除缓存
    await this.clearCache(guideData.userId)
    
    console.log(`[Guide Created] 用户 ${guideData.userId} 创建攻略: ${savedGuide.title}`)
    
    return savedGuide
  }

  /**
   * 根据用户ID查询攻略列表（分页）
   * @param userId 用户ID
   * @param page 页码（从1开始）
   * @param limit 每页数量
   * @param sortBy 排序字段（createdAt, viewCount, likeCount）
   * @param order 排序方向（ASC, DESC）
   * @returns 攻略列表和分页信息
   */
  async findByUserId(
    userId: string, 
    page: number = 1, 
    limit: number = 10,
    sortBy: 'createdAt' | 'viewCount' | 'likeCount' = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ data: Guide[]; total: number; page: number; limit: number }> {
    // 验证分页参数
    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 10

    // 尝试从缓存获取
    const cacheKey = `guides:user:${userId}:${page}:${limit}:${sortBy}:${order}`
    const cached = await this.cacheManager.get<any>(cacheKey)
    if (cached) {
      return cached
    }

    const [data, total] = await this.guideRepository.findAndCount({
      where: { userId, deletedAt: IsNull() } as FindOptionsWhere<Guide>,
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    })

    const result = { data, total, page, limit }
    
    // 缓存结果
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL * 1000)

    return result
  }

  /**
   * 根据ID查询攻略
   * @param id 攻略ID
   * @param incrementView 是否增加浏览次数
   * @returns 攻略详情
   */
  async findById(id: string, incrementView: boolean = false): Promise<Guide> {
    const guide = await this.guideRepository.findOne({ 
      where: { id, deletedAt: IsNull() } as FindOptionsWhere<Guide>
    })
    
    if (!guide) {
      throw new NotFoundException('攻略不存在')
    }

    // 增加浏览次数（异步，不阻塞响应）
    if (incrementView) {
      this.incrementViewCount(id).catch(err => 
        console.error('增加浏览次数失败:', err)
      )
    }

    return guide
  }

  /**
   * 获取所有公开攻略（分页）
   * @param page 页码
   * @param limit 每页数量
   * @param sortBy 排序字段
   * @param order 排序方向
   * @returns 攻略列表和分页信息
   */
  async findPublic(
    page: number = 1,
    limit: number = 10,
    sortBy: 'createdAt' | 'viewCount' | 'likeCount' = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ data: Guide[]; total: number; page: number; limit: number }> {
    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 10

    const cacheKey = `guides:public:${page}:${limit}:${sortBy}:${order}`
    const cached = await this.cacheManager.get<any>(cacheKey)
    if (cached) {
      return cached
    }

    const [data, total] = await this.guideRepository.findAndCount({
      where: { isPublic: true, deletedAt: IsNull() } as FindOptionsWhere<Guide>,
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    })

    const result = { data, total, page, limit }
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL * 1000)

    return result
  }

  /**
   * 更新攻略
   * @param id 攻略ID
   * @param userId 用户ID（用于权限验证）
   * @param guideData 更新数据
   * @returns 更新后的攻略
   */
  async update(id: string, userId: string, guideData: Partial<Guide>): Promise<Guide> {
    // 验证权限
    await this.checkOwnership(id, userId)

    // 不允许修改某些字段
    const { id: _, userId: __, createdAt, viewCount, likeCount, ...updateData } = guideData as any

    await this.guideRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    })
    
    // 清除缓存
    await this.clearCache(userId)
    
    console.log(`[Guide Updated] 用户 ${userId} 更新攻略: ${id}`)
    
    return this.findById(id)
  }

  /**
   * 删除攻略（软删除）
   * @param id 攻略ID
   * @param userId 用户ID（用于权限验证）
   */
  async delete(id: string, userId: string): Promise<void> {
    // 验证权限
    await this.checkOwnership(id, userId)

    // 软删除
    await this.guideRepository.update(id, {
      deletedAt: new Date()
    })
    
    // 清除缓存
    await this.clearCache(userId)
    
    console.log(`[Guide Deleted] 用户 ${userId} 删除攻略: ${id}`)
  }

  /**
   * 永久删除攻略
   * @param id 攻略ID
   * @param userId 用户ID（用于权限验证）
   */
  async hardDelete(id: string, userId: string): Promise<void> {
    // 验证权限
    await this.checkOwnership(id, userId)

    await this.guideRepository.delete(id)
    
    // 清除缓存
    await this.clearCache(userId)
    
    console.log(`[Guide Hard Deleted] 用户 ${userId} 永久删除攻略: ${id}`)
  }

  /**
   * 恢复已删除的攻略
   * @param id 攻略ID
   * @param userId 用户ID
   */
  async restore(id: string, userId: string): Promise<Guide> {
    const guide = await this.guideRepository.findOne({
      where: { id, deletedAt: Not(IsNull()) } as FindOptionsWhere<Guide>
    })

    if (!guide) {
      throw new NotFoundException('攻略不存在或未被删除')
    }

    if (guide.userId !== userId) {
      throw new ForbiddenException('无权恢复此攻略')
    }

    await this.guideRepository.update(id, {
      deletedAt: null
    })

    await this.clearCache(userId)
    
    console.log(`[Guide Restored] 用户 ${userId} 恢复攻略: ${id}`)

    return this.findById(id)
  }

  /**
   * 增加浏览次数
   * @param id 攻略ID
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.guideRepository.increment({ id }, 'viewCount', 1)
  }

  /**
   * 增加点赞数
   * @param id 攻略ID
   */
  async incrementLikeCount(id: string): Promise<void> {
    await this.guideRepository.increment({ id }, 'likeCount', 1)
  }

  /**
   * 减少点赞数
   * @param id 攻略ID
   */
  async decrementLikeCount(id: string): Promise<void> {
    await this.guideRepository.decrement({ id }, 'likeCount', 1)
  }

  /**
   * 搜索攻略（全文搜索）
   * @param keyword 关键词
   * @param page 页码
   * @param limit 每页数量
   * @param onlyPublic 是否只搜索公开攻略
   * @returns 攻略列表和分页信息
   */
  async search(
    keyword: string,
    page: number = 1,
    limit: number = 10,
    onlyPublic: boolean = true
  ): Promise<{ data: Guide[]; total: number; page: number; limit: number }> {
    if (!keyword || keyword.trim().length === 0) {
      throw new BadRequestException('搜索关键词不能为空')
    }

    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 10

    const cacheKey = `guides:search:${keyword}:${page}:${limit}:${onlyPublic}`
    const cached = await this.cacheManager.get<any>(cacheKey)
    if (cached) {
      return cached
    }

    const queryBuilder = this.guideRepository
      .createQueryBuilder('guide')
      .where('guide.deletedAt IS NULL')

    if (onlyPublic) {
      queryBuilder.andWhere('guide.isPublic = :isPublic', { isPublic: true })
    }

    queryBuilder
      .andWhere(
        '(guide.title LIKE :keyword OR guide.destination LIKE :keyword OR guide.content LIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
      .orderBy('guide.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await queryBuilder.getManyAndCount()

    const result = { data, total, page, limit }
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL * 1000)

    return result
  }

  /**
   * 获取用户攻略统计
   * @param userId 用户ID
   * @returns 统计信息
   */
  async getUserStats(userId: string): Promise<{
    total: number
    public: number
    private: number
    totalViews: number
    totalLikes: number
  }> {
    const guides = await this.guideRepository.find({
      where: { userId, deletedAt: IsNull() } as FindOptionsWhere<Guide>
    })

    return {
      total: guides.length,
      public: guides.filter(g => g.isPublic).length,
      private: guides.filter(g => !g.isPublic).length,
      totalViews: guides.reduce((sum, g) => sum + g.viewCount, 0),
      totalLikes: guides.reduce((sum, g) => sum + g.likeCount, 0)
    }
  }
}
