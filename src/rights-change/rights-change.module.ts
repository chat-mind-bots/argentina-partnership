import { Module } from '@nestjs/common';
import { RightsChangeService } from './rights-change.service';
import { RightsChangeController } from './rights-change.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RightsChange,
  RightsChangeSchema,
} from 'src/rights-change/rights-change.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightsChange.name, schema: RightsChangeSchema },
    ]),
  ],
  controllers: [RightsChangeController],
  providers: [RightsChangeService],
  exports: [RightsChangeService],
})
export class RightsChangeModule {}
