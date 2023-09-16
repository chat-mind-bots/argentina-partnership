import { Module } from '@nestjs/common';
import { TariffService } from 'src/tariff/tariff.service';
import { TariffController } from 'src/tariff/tariff.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tariff, TariffSchema } from 'src/tariff/tariff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tariff.name, schema: TariffSchema }]),
  ],
  controllers: [TariffController],
  providers: [TariffService],
})
export class TariffModule {}
