import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [HttpModule, UserModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
