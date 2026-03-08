import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcrypt'

/**
 * 认证服务
 * 处理用户注册、登录、JWT token生成
 */
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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
   * 用户登录
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns JWT token和用户信息
   */
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

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
    // 检查邮箱是否已注册
    const existingUser = await this.userService.findByEmail(email)
    if (existingUser) {
      throw new ConflictException('该邮箱已被注册')
    }

    // 验证密码强度
    if (password.length < 6) {
      throw new UnauthorizedException('密码长度至少为6位')
    }

    // 验证用户名
    if (username.length < 2 || username.length > 20) {
      throw new UnauthorizedException('用户名长度应在2-20位之间')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户
    const user = await this.userService.create({
      email,
      username,
      password: hashedPassword,
    })

    // 自动登录
    return this.login(email, password)
  }

  /**
   * 刷新token
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

    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
