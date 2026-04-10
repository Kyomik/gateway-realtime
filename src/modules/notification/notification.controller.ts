import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { BaseNotificationDto } from './dto/base-notification.dto';
import { ApiAuthGuard } from '../auth/guards/api-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RestRateLimitGuard } from '../ratelimitters/guards/rest-ratelimit.guard';
import { RateLimit } from '../ratelimitters/decorators/ratelimit.decorator';

@Controller('notifications')
@UseGuards(RestRateLimitGuard)
export class NotificationController {
  constructor(
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post()
  @RateLimit('preConnect')
  @UseGuards(ApiAuthGuard)
  async send(@Body() dto: BaseNotificationDto, @Request() req) {
    const clientId = req.client.client_id;

    this.eventEmitter.emit('notification.requested', {
      clientId,
      dto
    });

    return { 
      isSuccess: true, 
      message: 'Notification request accepted and is being processed' 
    };
  }
}