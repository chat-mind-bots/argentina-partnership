import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purchase, PurchaseDocument } from 'src/purchase/purchase.schema';
import { UserService } from 'src/user/user.service';
import { TariffService } from 'src/tariff/tariff.service';
import { BalanceService } from 'src/balance/balance.service';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
    private readonly tariffService: TariffService,
    private readonly userService: UserService,
    private readonly balanceService: BalanceService,
    private readonly subscriptionService: SubscriptionService,
  ) {}
  async create(userId: number, dto: CreatePurchaseDto) {
    const user = await this.userService.findWithBalanceByTgId(userId);

    const masItems = dto.items.map((item) => item.item);
    const tariff = await this.tariffService.findTariffByIds(masItems);
    if (tariff.price > user.balance.amount) {
      throw new HttpException(
        'Not enough balance amount',
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const reduceBalance = await this.balanceService.reduceBalance(
        user.balance._id,
        tariff.price,
      );
      if (reduceBalance) {
        const purchase = await this.purchaseModel.create({
          user: user.id,
          balance: user.balance._id,
          total: tariff.price,
          totalPay: tariff.price,
          ...dto,
        });

        if (purchase) {
          const sub = await this.subscriptionService.create({
            tariff: tariff.id,
            purchase: purchase.id,
            userId: user.id,
            period: tariff.period,
          });
          console.log(sub);
        }
        return purchase;
      }
    } catch (error) {
      throw new HttpException(
        'Not enough balance amount',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async findById(id: string) {
    return this.purchaseModel.findById(id);
  }
}
