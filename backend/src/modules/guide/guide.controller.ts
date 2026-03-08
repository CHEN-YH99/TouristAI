import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { GuideService } from './guide.service'

@Controller('guides')
export class GuideController {
  constructor(private guideService: GuideService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.guideService.create({
      ...body,
      userId: req.user.userId,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    return this.guideService.findByUserId(req.user.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.guideService.findById(id)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.guideService.update(id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.guideService.delete(id)
    return { message: '删除成功' }
  }
}
