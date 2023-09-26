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
import { PaymentTypeEnum } from 'src/payment/enums/payment-type.enum';
import { CryptomusService } from 'src/cryptomus/cryptomus.service';
import { CryptomusPaymentCallbackDto } from 'src/cryptomus/dto/cryptomus-payment-callback.dto';
import { StatusEnum } from 'src/cryptomus/interfaces/status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly userService: UserService,
    private readonly balanceService: BalanceService,
    private readonly cryptomusService: CryptomusService,
  ) {}

  async createPayment(userId: number, dto: CreatePaymentDto) {
    const user = await this.userService.findByTgId(userId, true);

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
      paymentType: dto.paymentType,
    };
    let payment = await this.paymentModel.create({ ...paymentDto });
    //в зависимости от типа если криптомус то криптомус сервис createPayment и если криптомус то нужно payment обновить
    if (payment.paymentType === PaymentTypeEnum.CRYPTOMUS) {
      const cryptomus = await this.cryptomusService.createPayment(
        dto.amount,
        String(payment._id),
      );
      if (cryptomus) {
        await payment.updateOne({
          $set: {
            data: {
              ...payment.data,
              uuid: cryptomus.result.uuid,
              payment_link: cryptomus.result.url,
            },
          },
        });
        payment = await this.paymentModel.findById(payment.id);
      }
    }
    return payment;
  }

  async getUserPayments(userId: number, query: GetUserPaymentsQueryDto) {
    const user = await this.userService.findByTgId(userId, true);

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

    const total = await this.paymentModel.countDocuments({ ...filters }).exec();

    const result = await this.paymentModel
      .find({ ...filters })
      .sort({ createdAt: -1 })
      .skip(query.offset)
      .limit(query.limit);

    return {
      data: result,
      total,
    };
  }

  async getUserPaymentsCount(userId: number, query: GetUserPaymentsQueryDto) {
    const user = await this.userService.findByTgId(userId, true);

    if (!user) {
      throw new HttpException(
        'Document (User) not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const filters = {
      user: user._id,
    };

    if (query.status) {
      filters['status'] = query.status;
    }

    const total = await this.paymentModel.countDocuments({ ...filters }).exec();

    return total;
  }
  async getPaymentForWeb(userId: number, paymentId: string) {
    const payment = await this.getPayment(paymentId);
    const user = await this.userService.findByTgId(userId, true);

    if (String(payment.user) !== String(user._id)) {
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
    userId: number,
    paymentId: string,
    dto: UpdatePaymentDto,
  ) {
    const payment = await this.getPayment(paymentId);
    const user = await this.userService.findByTgId(userId, false);

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

    const payment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        { status: PaymentStatusEnum.SUCCESS, updatedAt: new Date() },
        { new: true },
      )
      .populate<{ user: Pick<UserDocument, 'refId'> }>('user', 'refId');

    await this.balanceService.topUpBalance(
      String(payment.balance),
      payment.amount,
    );

    if (payment.user.refId) {
      const userReferrer = await this.userService.findById(
        String(payment.user.refId),
        true,
      );
      await this.balanceService.topUpBalance(
        String(userReferrer.balance._id),
        Math.round(payment.amount * 0.05 * 100) / 100,
      );
    }

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

  async getReviewPayments(limit?: number, offset?: number) {
    const data = await this.paymentModel
      .find({ status: PaymentStatusEnum.REVIEW })
      .populate<{ user: UserDocument }>('user')
      .limit(limit)
      .skip(offset);
    const total = await this.paymentModel.countDocuments({
      status: PaymentStatusEnum.REVIEW,
    });
    return { data, total };
  }

  async paymentCheck(dto: CryptomusPaymentCallbackDto) {
    const payment = await this.paymentModel.findById(dto.order_id);
    const { status } = dto;
    if (payment.status === PaymentStatusEnum.PENDING) {
      if (
        status === StatusEnum.CANCEL ||
        status === StatusEnum.SYSTEM_FAIL ||
        StatusEnum.FAIL
      ) {
        this.movePaymentToReject(dto.order_id);
      }
      if (status === StatusEnum.PAID || status === StatusEnum.PAID_OVER) {
        this.movePaymentToSuccess(dto.order_id);
      }
    }
  }
}
