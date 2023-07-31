import { Injectable } from '@nestjs/common';
import { UserChangeCreateDto } from 'src/rights-change/dto/user-change-create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RightsChange,
  RightsChangeDocument,
} from 'src/rights-change/rights-change.schema';

@Injectable()
export class RightsChangeService {
  constructor(
    @InjectModel(RightsChange.name)
    private readonly rightsChangeModel: Model<RightsChangeDocument>,
  ) {}
  async create(dto: UserChangeCreateDto) {
    const result = await this.rightsChangeModel.create(dto);
  }
}
