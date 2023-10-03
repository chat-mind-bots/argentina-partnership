import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Balance, BalanceDocument } from 'src/balance/balance.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(Balance.name)
    private readonly balanceModel: Model<BalanceDocument>,
  ) {}

  async createBalance() {
    return this.balanceModel.create({});
  }

  async showAmountBalance(id: Types.ObjectId) {
    const balance = await this.balanceModel.findById(id);
    if (!balance) {
      throw new HttpException(
        'Document (Balance) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return balance.amount;
  }

  async topUpBalance(id: string, amount: number) {
    return this.balanceModel.findByIdAndUpdate(
      id,
      {
        $inc: { amount: amount },
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async reduceBalance(id: string, amount: number) {
    return this.balanceModel.findByIdAndUpdate(
      id,
      {
        $inc: { amount: -amount },
        updatedAt: new Date(),
      },
      { new: true },
    );
  }
}
