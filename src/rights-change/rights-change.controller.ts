import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RightsChangeService } from './rights-change.service';
import { UserChangeCreateDto } from 'src/rights-change/dto/user-change-create.dto';
import { TicketStatus } from 'src/rights-change/rights-change.schema';
import { ChangeRoles } from 'src/rights-change/types';
import { Types } from 'mongoose';

@Controller('rights-change')
export class RightsChangeController {
  constructor(private readonly rightsChangeService: RightsChangeService) {}

  @Get(':userId')
  async findTicket(
    @Param('userId') userId: string,
    @Query('role') role: ChangeRoles,
  ) {
    return await this.rightsChangeService.findTicket(
      userId,
      role,
      TicketStatus.PENDING,
    );
  }

  @Post()
  async createTicket(@Body() body: UserChangeCreateDto) {
    console.log(body);
    return await this.rightsChangeService.create({
      ...body,
      user: new Types.ObjectId(body.user),
      status: TicketStatus.PENDING,
    });
  }
}
