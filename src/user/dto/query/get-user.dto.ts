import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export interface GetUserDto {
  role: UserRoleEnum;
  limit?: number;
  offset?: number;
  isShowBalance?: boolean;
}
