import { Controller, Get, Param, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Get(':userId')
  findSubscription(
    @Query('isActive') isActive: boolean,
    @Param('userId') userId,
  ) {
    return this.subscriptionService.findSubscription(userId, isActive);
  }
}
