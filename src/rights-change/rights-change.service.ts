import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserChangeCreateDto } from 'src/rights-change/dto/user-change-create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RightsChange,
  RightsChangeDocument,
  TicketStatus,
} from 'src/rights-change/rights-change.schema';
import { ChangeRoles } from 'src/rights-change/types';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { User } from 'src/user/user.schema';

@Injectable()
export class RightsChangeService {
  constructor(
    @InjectModel(RightsChange.name)
    private readonly rightsChangeModel: Model<RightsChangeDocument>,
  ) {}
  async create(dto: UserChangeCreateDto) {
    const result = await this.rightsChangeModel.create(dto);
    return result;
  }

  async updateStatus(id: string, status: TicketStatus) {
    const ticket = await this.findTicketById(id);
    await ticket.updateOne({ $set: { status } });
    return await this.findTicketById(id);
  }

  async findTicket(id: string, role: ChangeRoles, status: TicketStatus) {
    const ticket = await this.rightsChangeModel.findOne({
      user: new Types.ObjectId(id),
      role,
      status,
    });
    if (!ticket) {
      throw new HttpException(
        'Document (RightsChange) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return ticket;
  }

  async findTicketById(id: string) {
    const ticket = await this.rightsChangeModel
      .findOne({ _id: id })
      .populate<{ user: Pick<User, 'username' | 'first_name' | 'tg_id'> }>({
        path: 'user',
        select: 'username first_name tg_id',
      });
    if (!ticket) {
      throw new HttpException(
        'Document (RightsChange) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return ticket;
  }

  async findTicketsByStatus(role: UserRoleEnum, status: TicketStatus) {
    const tickets = await this.rightsChangeModel
      .find({ status, role })
      .populate<{ user: Pick<User, 'username' | 'first_name' | 'tg_id'> }>({
        path: 'user',
        select: 'username first_name tg_id',
      });
    return tickets;
  }
}
