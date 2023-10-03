import { IsNumber } from 'class-validator';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { TicketStatus } from 'src/rights-change/rights-change.schema';
import { Types } from 'mongoose';

export class UserChangeCreateDto {
  @IsNumber()
  readonly user: Types.ObjectId;
  @IsNumber()
  readonly role: UserRoleEnum;
  @IsNumber()
  readonly status: TicketStatus;
}
