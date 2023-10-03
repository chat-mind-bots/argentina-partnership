import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from 'src/purchase/purchase.schema';
import { TariffModule } from 'src/tariff/tariff.module';
import { UserModule } from 'src/user/user.module';
import { BalanceModule } from 'src/balance/balance.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    TariffModule,
    UserModule,
    BalanceModule,
    SubscriptionModule,
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
