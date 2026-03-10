import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import * as bcrypt from 'bcrypt'

/**
 * 认证服务（增强版）
 * 
 * 功能特性：
 * - 用户注册、登录、JWT token生成
 * - 密码强度验证（至少6位、包含字母数字）
 * - 用户名验证（2-20位、仅字母数字下划线）
 * - Token刷新机制
 * - 账号锁定机制（5次失败锁定30分钟）
 * - 登录日志记录
 * - 邮箱格式验证
 */
@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOCK_TIME = 30 * 60 // 30分钟（秒）
  private readonly ATTEMPT_WINDOW = 15 * 60 // 15分钟（秒）

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 验证用户凭证
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 用户信息（不含密码）或null
   */
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    const { password: _, ...result } = user
    return result
  }

  /**
   * 检查账号是否被锁定
   * @param email 用户邮箱
   * @throws UnauthorizedException 如果账号被锁定
   */
  private async checkAccountLock(email: string): Promise<void> {
    const lockKey = `account_lock:${email}`
    const isLocked = await this.cacheManager.get(lockKey)
    
    if (isLocked) {
      const ttl = await this.cacheManager.store.ttl(lockKey)
      const minutes = Math.ceil(ttl / 60)
      throw new UnauthorizedException(
        `账号已被锁定，请${minutes}分钟后重试`
      )
    }
  }

  /**
   * 记录登录失败
   * @param email 用户邮箱
   */
  private async recordLoginFailure(email: string): Promise<void> {
    const attemptKey = `login_attempts:${email}`
    const lockKey = `account_lock:${email}`
    
    // 获取当前失败次数
    let attempts = (await this.cacheManager.get<number>(attemptKey)) || 0
    attempts++
    
    // 记录失败次数（15分钟内有效）
    await this.cacheManager.set(attemptKey, attempts, this.ATTEMPT_WINDOW * 1000)
    
    // 如果失败次数达到上限，锁定账号
    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      await this.cacheManager.set(lockKey, true, this.LOCK_TIME * 1000)
      await this.cacheManager.del(attemptKey)
      
      console.warn(`账号 ${email} 因多次登录失败被锁定`)
    }
  }

  /**
   * 清除登录失败记录
   * @param email 用户邮箱
   */
  private async clearLoginFailures(email: string): Promise<void> {
    const attemptKey = `login_attempts:${email}`
    await this.cacheManager.del(attemptKey)
  }

  /**
   * 记录登录日志
   * @param userId 用户ID
   * @param email 用户邮箱
   * @param success 是否成功
   */
  private async logLogin(userId: string, email: string, success: boolean): Promise<void> {
    const logEntry = {
      userId,
      email,
      success,
      timestamp: new Date().toISOString(),
      ip: 'unknown' // 可以从请求中获取
    }
    
    // 这里可以保存到数据库或日志系统
    console.log('[Login Log]', logEntry)
  }

  /**
   * 验证邮箱格式
   * @param email 邮箱地址
   * @throws BadRequestException 如果格式不正确
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new BadRequestException('邮箱格式不正确')
    }
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @throws BadRequestException 如果密码不符合要求
   */
  private validatePassword(password: string): void {
    if (password.length < 6) {
      throw new BadRequestException('密码至少6位')
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      throw new BadRequestException('密码必须包含字母')
    }
    
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('密码必须包含数字')
    }
  }

  /**
   * 验证用户名
   * @param username 用户名
   * @throws BadRequestException 如果用户名不符合要求
   */
  private validateUsername(username: string): void {
    if (username.length < 2 || username.length > 20) {
      throw new BadRequestException('用户名长度为2-20位')
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('用户名只能包含字母、数字和下划线')
    }
  }

  /**
   * 用户登录
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns JWT token和用户信息
   */
  async login(email: string, password: string) {
    // 验证邮箱格式
    this.validateEmail(email)
    
    // 检查账号是否被锁定
    await this.checkAccountLock(email)
    
    // 验证用户凭证
    const user = await this.validateUser(email, password)
    
    if (!user) {
      // 记录登录失败
      await this.recordLoginFailure(email)
      
      // 获取剩余尝试次数
      const attempts = (await this.cacheManager.get<number>(`login_attempts:${email}`)) || 0
      const remaining = this.MAX_LOGIN_ATTEMPTS - attempts
      
      if (remaining > 0) {
        throw new UnauthorizedException(
          `邮箱或密码错误，还有${remaining}次尝试机会`
        )
      } else {
        throw new UnauthorizedException('邮箱或密码错误')
      }
    }

    // 清除登录失败记录
    await this.clearLoginFailures(email)
    
    // 记录登录成功日志
    await this.logLogin(user.id, email, true)

    // 生成JWT token
    const payload = { 
      email: user.email, 
      sub: user.id,
      membershipType: user.membershipType 
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        membershipType: user.membershipType,
        dailyQuota: user.dailyQuota,
        usedQuota: user.usedQuota,
        quotaResetAt: user.quotaResetAt,
      }
    }
  }

  /**
   * 用户注册
   * @param email 用户邮箱
   * @param username 用户名
   * @param password 用户密码
   * @returns JWT token和用户信息
   */
  async register(email: string, username: string, password: string) {
    // 验证邮箱格式
    this.validateEmail(email)
    
    // 验证用户名
    this.validateUsername(username)
    
    // 验证密码强度
    this.validatePassword(password)
    
    // 检查邮箱是否已注册
    const existingUser = await this.userService.findByEmail(email)
    if (existingUser) {
      throw new ConflictException('该邮箱已被注册')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户
    const user = await this.userService.create({
      email,
      username,
      password: hashedPassword,
    })

    console.log(`[Register] 新用户注册: ${email} (${username})`)

    // 自动登录
    return this.login(email, password)
  }

  /**
   * 刷新Token
   * @param userId 用户ID
   * @returns 新的JWT token
   */
  async refreshToken(userId: string) {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      membershipType: user.membershipType 
    }

    console.log(`[Token Refresh] 用户 ${user.email} 刷新token`)

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    }
  }

  /**
   * 验证Token
   * @param token JWT token
   * @returns 解码后的payload
   */
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token)
    } catch (error) {
      throw new UnauthorizedException('Token无效或已过期')
    }
  }
}
