import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RightsChangeModule } from './rights-change/rights-change.module';
import { CategoriesModule } from './categories/categories.module';
import { UserCodesModule } from './user-codes/user-codes.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { PaymentModule } from './payment/payment.module';
import { CryptomusModule } from './cryptomus/cryptomus.module';
import { BusinessModule } from 'src/business/business.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    BotModule,
    UserModule,
    RightsChangeModule,
    CategoriesModule,
    UserCodesModule,
    QrcodeModule,
    PaymentModule,
    CryptomusModule,
    BusinessModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
