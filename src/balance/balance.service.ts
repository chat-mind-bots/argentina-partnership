import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Balance, BalanceDocument } from 'src/balance/balance.schema';
import { Model } from 'mongoose';

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(Balance.name)
    private readonly balanceModel: Model<BalanceDocument>,
  ) {}

  async createBalance() {
    return this.balanceModel.create({});
  }
}
