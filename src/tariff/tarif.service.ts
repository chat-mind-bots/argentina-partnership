import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tariff, TariffDocument } from 'src/tariff/tariff.schema';
import { Model } from 'mongoose';
import { CreateTariffDto } from 'src/tariff/dto/create-tariff.interface';

@Injectable()
export class TariffService {
  constructor(
    @InjectModel(Tariff.name)
    private readonly tariffModel: Model<TariffDocument>,
  ) {}

  async createTariff(dto: CreateTariffDto) {
    console.log(dto);
    return this.tariffModel.create({ ...dto });
  }
}
