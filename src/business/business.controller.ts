import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';
import { MongoIdPipe } from 'pipes/mongo-id.pipe';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async createBusiness(
    @Query('useId') userId: number,
    @Body() dto: CreateBusinessDto,
  ) {
    return await this.businessService.create(userId, dto);
  }

  @Get(':businessId')
  @UsePipes(MongoIdPipe)
  async getBusiness(@Param('businessId') businessId: string) {
    return await this.businessService.findBusinessById(businessId);
  }

  // @Get('list')
  // async getBusinessList(@Param() businessId: string) {
  //   return await this.businessService.findBusinessById(businessId);
  // }

  @Patch(':businessId')
  @UsePipes(MongoIdPipe)
  async updateBusiness(
    @Query('userId') userId: number,
    @Param('businessId') businessId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    // const user = await this.businessService.findPartnerByTgId(userId);
    // const isCategoryExits = await this.businessService.findCategory(
    //   dto.categoryName,
    // );
    //
    // if (!user.role.includes(UserRoleEnum.PARTNER)) {
    //   throw new HttpException('User not partner', HttpStatus.NOT_ACCEPTABLE);
    // }
    // if (!!isCategoryExits) {
    //   return await this.businessService.updateBusiness(businessId, dto);
    // }
  }
}
