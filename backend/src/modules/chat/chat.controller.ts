import { Controller, Post, Body, UseGuards, Request, Res, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ChatService } from './chat.service'
import { UserService } from '../user/user.service'

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('stream')
  async streamChat(
    @Request() req,
    @Body() body: { message: string; history?: any[] },
    @Res() res: Response,
  ) {
    const canUse = await this.userService.incrementQuota(req.user.userId)
    if (!canUse) {
      throw new HttpException('今日配额已用完', HttpStatus.TOO_MANY_REQUESTS)
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      const stream = await this.chatService.streamChat(body.message, body.history)
      
      stream.on('data', (chunk: Buffer) => {
        res.write(chunk)
      })

      stream.on('end', () => {
        res.end()
      })

      stream.on('error', (error: Error) => {
        console.error('Stream error:', error)
        res.write(`data: ${JSON.stringify({ error: '服务暂时不可用' })}\n\n`)
        res.end()
      })
    } catch (error) {
      console.error('Chat error:', error)
      res.write(`data: ${JSON.stringify({ error: '服务暂时不可用' })}\n\n`)
      res.end()
    }
  }
}
