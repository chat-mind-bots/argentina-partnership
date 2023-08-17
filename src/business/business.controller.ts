import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post(':userId/create')
  async createBusiness(
    @Param('userId') userId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    const user = await this.businessService.findPartnerByTgId(Number(userId));
    const category = await this.businessService.findCategory(dto.categoryName);

    if (!user.role.includes(UserRoleEnum.PARTNER)) {
      throw new HttpException('User not partner', HttpStatus.NOT_ACCEPTABLE);
    }
    if (!!category) {
      return await this.businessService.create(user.id, category.id, dto);
    }
  }

  @Get(':businessId')
  async getBusiness(@Param() businessId: string) {
    return await this.businessService.findBusinessById(businessId);
  }

  // @Get('list')
  // async getBusinessList(@Param() businessId: string) {
  //   return await this.businessService.findBusinessById(businessId);
  // }

  @Patch(':userId/business/:businessId')
  async updateBusiness(
    @Param() userId: number,
    @Param() businessId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    const user = await this.businessService.findPartnerByTgId(userId);
    const isCategoryExits = await this.businessService.findCategory(
      dto.categoryName,
    );

    if (!user.role.includes(UserRoleEnum.PARTNER)) {
      throw new HttpException('User not partner', HttpStatus.NOT_ACCEPTABLE);
    }
    if (!!isCategoryExits) {
      return await this.businessService.updateBusiness(businessId, dto);
    }
  }
}
