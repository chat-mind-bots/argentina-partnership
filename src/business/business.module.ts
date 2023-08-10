import { Module } from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';
import { BusinessController } from 'src/business/business.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from 'src/business/business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
