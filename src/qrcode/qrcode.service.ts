import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QrcodeService {
  async getQrCodeByParam(
    param: string,
    colorSchema?: { dark: string; light: string },
  ): Promise<Buffer> {
    const qrImage = await this.generateQRCode(param, colorSchema);
    return qrImage;
  }

  async generateQRCode(
    url,
    colorSchema?: { dark: string; light: string },
  ): Promise<Buffer> {
    const opts = {
      margin: 1,
      quality: 1,
      color: colorSchema ?? {},
    };
    const dataUrl = await QRCode.toDataURL(url, opts);
    return Buffer.from(dataUrl.split(',')[1], 'base64');
  }
}
