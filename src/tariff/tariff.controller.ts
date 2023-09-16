import { Controller } from '@nestjs/common';
import { TariffService } from 'src/tariff/tariff.service';

@Controller('tariff')
export class TariffController {
  constructor(private readonly tariffService: TariffService) {}
  // @Post()
  // async createTariff(@Body() body: CreateTariffDto) {
  //   return this.tariffService.createTariff(body);
  // }
}
