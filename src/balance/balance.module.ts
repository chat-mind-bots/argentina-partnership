import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Balance, BalanceSchema } from 'src/balance/balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Balance.name, schema: BalanceSchema }]),
  ],
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
