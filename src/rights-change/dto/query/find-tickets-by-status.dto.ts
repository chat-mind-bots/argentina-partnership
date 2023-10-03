import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { TicketStatus } from 'src/rights-change/rights-change.schema';

export interface FindTicketsByStatusDto {
  role: UserRoleEnum;
  status: TicketStatus;
  limit?: number;
  offset?: number;
}
