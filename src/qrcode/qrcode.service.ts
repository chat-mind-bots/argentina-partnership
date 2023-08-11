import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class QrcodeService {
  async getQrCodeByParam(param: string): Promise<Buffer> {
    const qrImage = await this.generateQRCode(param);
    return qrImage;
  }

  async generateQRCode(url): Promise<Buffer> {
    return await QRCode.toBuffer(url);
  }
}
