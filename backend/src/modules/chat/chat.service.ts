import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class ChatService {
  private aiServiceUrl: string

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL')
  }

  async streamChat(message: string, history: any[] = []) {
    const url = `${this.aiServiceUrl}/api/v1/chat/stream`
    
    const response = await firstValueFrom(
      this.httpService.post(url, {
        message,
        history,
      }, {
        responseType: 'stream',
      })
    )

    return response.data
  }
}
