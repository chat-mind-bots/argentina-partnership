import { Body, Controller, Post, Query, Get } from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';
import { GetUserPaymentsQueryDto } from 'src/payment/dto/query/get-user-payments-query.dto';
import { CreatePaymentQueryDto } from 'src/payment/dto/query/create-payment-query.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(
    @Query() { userId }: CreatePaymentQueryDto,
    @Body() body: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(userId, body);
  }

  @Get()
  async getUserPayments(@Query() query: GetUserPaymentsQueryDto) {
    return this.paymentService.getUserPayments(query.userId, query);
  }
}
