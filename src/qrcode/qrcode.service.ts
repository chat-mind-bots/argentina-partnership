import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class QrcodeService {
  async getQrCodeByParam(param: string): Promise<Buffer> {
    const qrImage = await this.generateQRCode(
      `${process.env.MODE === 'LOCAL' ? 'http' : 'https'}://${
        process.env.BASE_URL
      }/user-codes/${param}`,
    );
    console.log(
      `${process.env.MODE === 'LOCAL' ? 'http' : 'https'}://${
        process.env.BASE_URL
      }/user-codes/${param}`,
    );
    return qrImage;
  }

  async generateQRCode(url): Promise<Buffer> {
    return await QRCode.toBuffer(url);
  }

  async checkQrCode(query: string) {
    console.log(query);
    return;
  }
}
