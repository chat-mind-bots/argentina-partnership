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
    return this.tariffModel.create({ ...dto });
  }

  async findTariffById(id: string) {
    return this.tariffModel.findById(id);
  }

  async findTariffByIds(ids: string[]) {
    return this.tariffModel.findOne({ _id: { $in: ids } });
  }
  async findAllTariffs() {
    return this.tariffModel.find().sort({ price: 1 });
  }
}
