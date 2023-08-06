import { Controller, Get, Query } from '@nestjs/common';
import { QrcodeService } from 'src/qrcode/qrcode.service';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrCodeService: QrcodeService) {}

  @Get()
  async checkQrCode(@Query('code') code: string) {
    return this.qrCodeService.checkQrCode(code);
  }
}
