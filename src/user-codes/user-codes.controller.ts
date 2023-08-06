import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserCodesService } from 'src/user-codes/user-codes.service';

@Controller('user-codes')
export class UserCodesController {
  constructor(private readonly userCodesService: UserCodesService) {}

  @Get(':code')
  // @Render('code')
  async userCodesCheck(@Param('code') code: string, @Res() res: Response) {
    const status = await this.userCodesService.checkCode(code);
    return res.render(status === 'authorized' ? 'code-true' : 'code-false', {
      status,
    });
  }
}
