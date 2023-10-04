import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { TariffService } from 'src/tariff/tariff.service';
import { CreateTariffDto } from 'src/tariff/dto/create-tariff.interface';

@Controller('tariff')
export class TariffController {
  constructor(private readonly tariffService: TariffService) {}
  @Post()
  async createTariff(@Body() body: CreateTariffDto) {
    return this.tariffService.createTariff(body);
  }
  @Get()
  async findAllTariffs() {
    return this.tariffService.findAllTariffs();
  }
}
