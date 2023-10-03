import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { FileModule } from './file/file.module';
import { S3Module } from 'nestjs-s3';
import { BalanceModule } from './balance/balance.module';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { AuthMiddleware as CryptomusAuthMiddleware } from 'src/cryptomus/middlewares/auth.middleware';
import { TariffModule } from 'src/tariff/tariff.module';
import { PurchaseModule } from './purchase/purchase.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    S3Module.forRootAsync({
      useFactory: () => ({
        config: {
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          },
          region: process.env.S3_REGION,
          endpoint: process.env.S3_ENDPOINT,
          s3ForcePathStyle: true,
          // signatureVersion: 'v4',
        },
      }),
    }),
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
    FileModule,
    BalanceModule,
    TariffModule,
    PurchaseModule,
    SubscriptionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({
        path: 'payment/check-payment/:paymentId',
        method: RequestMethod.ALL,
      })
      .forRoutes('*');
    consumer.apply(CryptomusAuthMiddleware).forRoutes({
      path: 'payment/check-payment/:paymentId',
      method: RequestMethod.ALL,
    });
    // consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
