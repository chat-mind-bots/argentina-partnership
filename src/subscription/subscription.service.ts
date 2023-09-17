import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from 'src/subscription/dto/create-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/subscription/subscription.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}
  async findSubscription(userId: string, isActive: boolean) {
    return isActive
      ? await this.subscriptionModel.find({
          user: userId,
          expiredDate: {
            $gte: new Date(),
          },
        })
      : await this.subscriptionModel.find({
          user: new Types.ObjectId(userId),
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
