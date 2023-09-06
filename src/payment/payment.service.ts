import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from 'src/payment/payment.schema';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';
import { GetUserPaymentsQueryDto } from 'src/payment/dto/query/get-user-payments-query.dto';
import { UpdatePaymentDto } from 'src/payment/dto/update-payment.dto';
import { PaymentStatusEnum } from 'src/payment/enums/payment-status.enum';
import { UserDocument } from 'src/user/user.schema';
import { BalanceDocument } from 'src/balance/balance.schema';
import { BalanceService } from 'src/balance/balance.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly userService: UserService,
    private readonly balanceService: BalanceService,
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
      .sort({ createdAt: -1 })
      .skip(query.offset)
      .limit(query.limit);

    return rersult;
  }

  async getPaymentForWeb(userId: string, paymentId: string) {
    const payment = await this.getPayment(paymentId);

    if (String(payment.user) !== String(userId)) {
      throw new HttpException(
        'You  are not  owner of this payment',
        HttpStatus.FORBIDDEN,
      );
    }

    return payment;
  }

  async getPayment(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId);

    if (!payment) {
      throw new HttpException(
        'Document (Payment) not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return payment;
  }

  async getPaymentWithUser(
    paymentId: string,
  ): Promise<
    PaymentDocument & { user: UserDocument; balance: BalanceDocument }
  > {
    const payment: PaymentDocument & {
      user: UserDocument;
      balance: BalanceDocument;
    } = await this.paymentModel.findById(paymentId).populate('user balance');

    if (!payment) {
      throw new HttpException(
        'Document (Payment) not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return payment;
  }
  async movePaymentToReview(
    userId: string,
    paymentId: string,
    dto: UpdatePaymentDto,
  ) {
    const payment = await this.getPayment(paymentId);
    const user = await this.userService.findById(userId, true);

    if (!user) {
      throw new HttpException(
        'Document (User) not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (String(user._id) !== String(payment.user)) {
      throw new HttpException(
        'You  are not  owner of this payment',
        HttpStatus.FORBIDDEN,
      );
    }

    await payment.updateOne({ ...dto, status: PaymentStatusEnum.REVIEW });

    return this.getPayment(paymentId);
  }

  async movePaymentToSuccess(id: string) {
    // const payment = await this.paymentModel.findById(id).populate('balance');

    const payment = await this.paymentModel.findByIdAndUpdate(
      id,
      { status: PaymentStatusEnum.SUCCESS, updatedAt: new Date() },
      { new: true },
    );

    await this.balanceService.topUpBalance(
      String(payment.balance),
      payment.amount,
    );

    return payment;
  }

  async movePaymentToReject(id: string) {
    return this.paymentModel.findByIdAndUpdate(
      id,
      {
        status: PaymentStatusEnum.REJECTED,
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async getReviewPayments(): Promise<
    Array<PaymentDocument & { user: UserDocument }>
  > {
    return this.paymentModel
      .find({ status: PaymentStatusEnum.REVIEW })
      .populate('user');
  }
}
