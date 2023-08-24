import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserCodesService } from 'src/user-codes/user-codes.service';
import { CreateCodeQueryDto } from 'src/user-codes/dto/create-code-query.dto';

@Controller('user-codes')
export class UserCodesController {
  constructor(private readonly userCodesService: UserCodesService) {}

  @Get(':code')
  async userCodesCheck(
    @Param('code') code: string,
    @Query('userId') userId: number,
  ) {
    const result = await this.userCodesService.checkCode(code, userId);
    return { status: result };
  }

  @Post()
  async createUserCode(@Query() query: CreateCodeQueryDto) {
    return this.userCodesService.getUserCodeForWeb(query);
  }
}
