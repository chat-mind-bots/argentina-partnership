import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('/business/create')
  async createBusiness(
    @Param() userId: number,
    @Body() dto: CreateBusinessDto,
  ) {
    const user = await this.businessService.findPartnerByTgId(userId);
    const isCategoryExits = await this.businessService.isCategoryExist(
      dto.categoryId,
    );

    if (!user.role.includes(UserRoleEnum.PARTNER)) {
      throw new HttpException('User not partner', HttpStatus.NOT_ACCEPTABLE);
    }
    if (isCategoryExits) {
      return await this.businessService.create(user.id, dto.categoryId, dto);
    }
  }
}
