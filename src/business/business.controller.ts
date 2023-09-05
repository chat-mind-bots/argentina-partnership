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
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { GetBusinessDto } from 'src/business/dto/query/get-business.dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async createBusiness(
    @Query('userId') userId: number,
    @Body() dto: CreateBusinessDto,
  ) {
    return await this.businessService.create(userId, dto);
  }

  @Get(':businessId')
  @UsePipes(MongoIdPipe)
  async getBusiness(@Param('businessId') businessId: string) {
    const result = await this.businessService.findBusinessById(businessId);
    return result;
  }

  @Get()
  async getBusinesses(@Query() query: GetBusinessDto) {
    const businesses = this.businessService.getBusinesses(query);
    return businesses;
  }

  @Patch(':businessId')
  @UsePipes(MongoIdPipe)
  async updateBusiness(
    @Query('userId') userId: number,
    @Param('businessId') businessId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    return await this.businessService.updateBusiness(userId, businessId, dto);
  }
}
