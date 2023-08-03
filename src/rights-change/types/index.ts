import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export type ChangeRoles = Exclude<
  UserRoleEnum,
  UserRoleEnum.USER | UserRoleEnum.SUPER_ADMIN
>;
