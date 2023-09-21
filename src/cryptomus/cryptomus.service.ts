import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CreatePaymentResult } from 'src/cryptomus/interfaces/create-payment-result.interface';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryDocument, Cryptomus } from 'src/cryptomus/cryptomus.schema';
import { Model } from 'mongoose';

@Injectable()
export class CryptomusService {
  private readonly logger = new Logger(CryptomusService.name);
  private apiKey: string;
  private merchantId: string;
  constructor(
    @InjectModel(Cryptomus.name)
    private readonly cryptomusModel: Model<CategoryDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = configService.get('CRYPTOMUS_API_KEY');
    this.merchantId = configService.get('CRYPTOMUS_MERCHANT_ID');
    // this.createPayment(10, 1);
  }

  private getHeaders(payload: string): { merchant: string; sign: string } {
    console.log('payload', payload);
    const sign = crypto
      .createHash('md5')
      .update(Buffer.from(payload).toString('base64') + this.apiKey)
      .digest('hex');
    return { merchant: this.merchantId, sign };
  }
  private async cryptomusMain<T>(
    url: string,
    payload: Record<string, any>,
  ): Promise<T> {
    console.log(this.getHeaders(JSON.stringify(payload)));
    const cryptoHeader = this.getHeaders(JSON.stringify(payload));
    const { data } = await firstValueFrom(
      this.httpService
        .post(`https://api.cryptomus.com/${url}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            merchant: cryptoHeader.merchant,
            sign: cryptoHeader.sign,
          },
        })
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(err.message);
            console.log(JSON.stringify(err));
            throw 'Some cryptomus error';
          }),
        ),
    );
    console.log('main', data);
    return data;
  }

  async createPayment(amount: number, orderId: string) {
    const payload = {
      amount: amount.toString(),
      currency: 'USDT',
      order_id: orderId,
      lifetime: 300,
      url_return: 'https://google.com',
      url_success: 'https://vk.com',
      url_callback: `https://${process.env.BASE_URL}/${orderId}`,
    };

    const url = 'v1/payment';

    const data = await this.cryptomusMain<CreatePaymentResult>(url, payload);
    console.log('payment', data);
    const cryptomus = await this.cryptomusModel.create(data);
    return cryptomus;
    // this.logger.log(data);
  }

  async checkPayment(uuid: string, orderId: string) {
    const payload = {
      uuid,
      order_id: orderId,
    };

    const url = 'v1/payment/info';

    const data = await this.cryptomusMain<CreatePaymentResult>(url, payload);

    this.logger.log(data);
  }
}
