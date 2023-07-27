import { IsArray, IsNumber, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export class CreateUserDto {
  @IsNumber()
  readonly balance: number;

  @IsString()
  readonly refCode: string;

  @IsNumber()
  readonly refId: number;

  @IsArray()
  readonly role: UserRoleEnum[];
}
