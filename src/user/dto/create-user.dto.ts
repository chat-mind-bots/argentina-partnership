import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsNumber()
  readonly tg_id: number;

  @IsNumber()
  readonly balance: number;

  @IsString()
  readonly refCode: string;

  @IsArray()
  readonly role: UserRoleEnum[];

  @IsObject()
  @IsOptional()
  readonly refId?: Types.ObjectId;
}
