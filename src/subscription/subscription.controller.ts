import { Controller, Get, Query, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { getIdByToken } from 'src/auth/auth.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Get()
  findSubscription(@Query('isActive') isActive: boolean, @Req() req) {
    const token = req.headers.authorization;
    const userId = +getIdByToken(token);
    return this.subscriptionService.findSubscription(userId, isActive);
  }
}
