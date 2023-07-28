import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsNumber()
  readonly balance: number;

  @IsString()
  readonly refCode: string;

  @IsObject()
  readonly refId: Types.ObjectId;

  @IsArray()
  readonly role: UserRoleEnum[];
}
