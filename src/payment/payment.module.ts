import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/payment/payment.schema';
import { UserModule } from 'src/user/user.module';
import { PaymentController } from './payment.controller';
import { BalanceModule } from 'src/balance/balance.module';
import { CryptomusModule } from 'src/cryptomus/cryptomus.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    UserModule,
    BalanceModule,
    CryptomusModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
