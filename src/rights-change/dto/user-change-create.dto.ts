import { IsNumber } from 'class-validator';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export class UserChangeCreateDto {
  @IsNumber()
  readonly tg_id: number;
  @IsNumber()
  readonly role: UserRoleEnum;
  @IsNumber()
  readonly status: number;
}
