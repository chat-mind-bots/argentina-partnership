import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CreatePaymentResult } from 'src/cryptomus/interfaces/create-payment-result.interface';

@Injectable()
export class CryptomusService {
  private readonly logger = new Logger(CryptomusService.name);
  private apiKey: string;
  private merchantId: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = configService.get('CRYPTOMUS_API_KEY');
    this.merchantId = configService.get('CRYPTOMUS_MERCHANT_ID');
    // this.createPayment(10, 1);
  }

  private getHeaders(payload: string): { merchant: string; sign: string } {
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
    const { data } = await firstValueFrom(
      this.httpService
        .post(`https://api.cryptomus.com/${url}`, payload, {
          headers: this.getHeaders(JSON.stringify(payload)),
        })
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(err.message);
            throw 'Some cryptomus error';
          }),
        ),
    );
    return data;
  }

  async createPayment(amount: number, orderId: number) {
    const payload = {
      amount,
      currency: 'USDT',
      order_id: orderId,
    };

    const url = 'v1/payment';

    const data = await this.cryptomusMain<CreatePaymentResult>(url, payload);
    this.logger.log(data);
  }

  async checkPayment(uuid: string, orderId: number) {
    const payload = {
      uuid,
      order_id: orderId,
    };

    const url = 'v1/payment/info';

    const data = await this.cryptomusMain<CreatePaymentResult>(url, payload);

    this.logger.log(data);
  }
}
