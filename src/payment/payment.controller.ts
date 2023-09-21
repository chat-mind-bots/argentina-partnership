import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';
import { GetUserPaymentsQueryDto } from 'src/payment/dto/query/get-user-payments-query.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { UpdatePaymentDto } from 'src/payment/dto/update-payment.dto';
import { getIdByToken } from 'src/auth/auth.service';
import { CryptomusPaymentCallbackDto } from 'src/cryptomus/dto/cryptomus-payment-callback.dto';
import { StatusEnum } from 'src/cryptomus/interfaces/status.enum';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(
    @Body() body: CreatePaymentDto,
    @Query('cryptomus') cryptomus: boolean,
    @Req() req,
  ) {
    const token = req.headers.authorization;
    const userId = +getIdByToken(token);
    return this.paymentService.createPayment(userId, body);
  }

  @Get()
  async getUserPayments(@Query() query: GetUserPaymentsQueryDto, @Req() req) {
    const token = req.headers.authorization;
    const userId = +getIdByToken(token);
    return this.paymentService.getUserPayments(userId, query);
  }

  @Get('total')
  async getUserPaymentsCount(
    @Query() query: GetUserPaymentsQueryDto,
    @Req() req,
  ) {
    const token = req.headers.authorization;
    const userId = +getIdByToken(token);

    return this.paymentService.getUserPaymentsCount(userId, query);
  }

  @Get(':paymentId')
  async getUserPayment(@Param('paymentId') paymentId: string, @Req() req) {
    const token = req.headers.authorization;
    const userId = +getIdByToken(token);
    return this.paymentService.getPaymentForWeb(userId, paymentId);
  }

  @Patch('/to-review/:paymentId')
  @UsePipes(MongoIdPipe)
  async updatePayment(
    @Param('paymentId') paymentId: string,
    @Body() body: UpdatePaymentDto,
    @Req() req,
  ) {
    const token = req.headers.authorization;
    const userId = +getIdByToken(token);
    return this.paymentService.movePaymentToReview(userId, paymentId, body);
  }

  @Post('/check-payment/:paymentId')
  async checkPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: CryptomusPaymentCallbackDto,
    @Req() req,
  ) {
    console.log('headers ', JSON.stringify(req.headers));
    console.log('body ', body);
    return this.paymentService.paymentCheck(body);
  }
}
