import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from 'src/payment/payment.schema';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';
import { GetUserPaymentsQueryDto } from 'src/payment/dto/query/get-user-payments-query.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly userService: UserService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const user = await this.userService.findById(userId, true);

    if (!user) {
      throw new HttpException(
        'Document (User) not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const paymentDto: Partial<Payment> = {
      user: user._id,
      balance: user.balance._id,
      currency: dto.currency,
      amount: dto.amount,
      method: dto.method,
    };
    const payment = await this.paymentModel.create({ ...paymentDto });

    return 'success';
  }

  async getUserPayments(userId: string, query: GetUserPaymentsQueryDto) {
    const user = await this.userService.findById(userId, true);

    if (!user) {
      throw new HttpException(
        'Document (User) not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const filters = {
      user: user._id,
    };

    if (query.currency) {
      filters['currency'] = query.currency;
    }

    if (query.status) {
      filters['status'] = query.status;
    }

    const rersult = await this.paymentModel
      .find({ ...filters })
      .skip(query.offset)
      .limit(query.limit);

    return rersult;
  }
}
