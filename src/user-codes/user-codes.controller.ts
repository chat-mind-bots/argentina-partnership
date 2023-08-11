import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserCodesService } from 'src/user-codes/user-codes.service';

@Controller('user-codes')
export class UserCodesController {
  constructor(private readonly userCodesService: UserCodesService) {}

  @Get(':code')
  async userCodesCheck(@Param('code') code: string) {
    return this.userCodesService.checkCode(code);
  }
}
