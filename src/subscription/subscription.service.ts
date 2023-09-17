import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from 'src/subscription/dto/create-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/subscription/subscription.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly userService: UserService,
  ) {}
  async findSubscription(userId: number, isActive: boolean) {
    const { id } = await this.userService.findByTgId(userId);
    return isActive
      ? await this.subscriptionModel.find({
          user: id,
          expiredDate: {
            $gte: new Date(),
          },
        })
      : await this.subscriptionModel.find({
          user: id,
        });
  }
  async create(dto: CreateSubscriptionDto) {
    const expiredDate = new Date().getTime() + dto.period;
    return this.subscriptionModel.create({
      user: dto.userId,
      tariff: dto.tariff,
      purchase: dto.purchase,
      expiredDate,
    });
  }
}
