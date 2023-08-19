import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserCodesService } from 'src/user-codes/user-codes.service';

@Controller('user-codes')
export class UserCodesController {
  constructor(private readonly userCodesService: UserCodesService) {}

  @Get(':code')
  async userCodesCheck(@Param('code') code: string, @Query('id') id: number) {
    const result = await this.userCodesService.checkCode(code, id);
    return { status: result };
  }
}
