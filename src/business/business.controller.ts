import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
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
import { BotLogger } from 'src/bot/bot.logger';

@Controller('business')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    @Inject(forwardRef(() => BotLogger))
    private readonly botLogger: BotLogger,
  ) {}

  @Post()
  async createBusiness(
    @Query('userId') userId: number,
    @Body() dto: CreateBusinessDto,
  ) {
    await this.botLogger.log(
      `user: ${userId}, ${JSON.stringify(dto)}, createBusiness`,
    );
    const result = await this.businessService.create(userId, dto);
    await this.botLogger.log(
      `result: ${JSON.stringify(result)}, createBusiness`,
    );
    return result;
  }

  @Get(':businessId')
  @UsePipes(MongoIdPipe)
  async getBusiness(@Param('businessId') businessId: string) {
    const result = await this.businessService.findBusinessById(businessId);
    await this.botLogger.log(
      `user: ${businessId}, ${JSON.stringify(result)}, get business`,
    );
    return result;
  }

  @Get()
  async getBusinesses(@Query() query: GetBusinessDto) {
    const businesses = this.businessService.getBusinesses(query);
    await this.botLogger.log(
      `user: ${JSON.stringify(businesses)}, get business`,
    );
    return businesses;
  }

  @Patch(':businessId')
  @UsePipes(MongoIdPipe)
  async updateBusiness(
    @Query('userId') userId: number,
    @Param('businessId') businessId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    await this.botLogger.log(
      `user: ${userId} ${JSON.stringify(dto)}, update business`,
    );
    const result = await this.businessService.updateBusiness(
      userId,
      businessId,
      dto,
    );
    await this.botLogger.log(
      `result: ${JSON.stringify(result)}, update business`,
    );
    return result;
  }
}
