import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { IContacts } from 'src/business/interfaces/contacts.interface';
import { IAddress } from 'src/business/interfaces/address.interface';
import { AvgCheckEnum } from 'src/business/enum/avg-check.enum';
import { StatusEnum } from 'src/business/enum/status.enum';

export class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  readonly categoryId?: string;

  @IsString()
  @IsOptional()
  readonly title?: string;

  @IsEnum(StatusEnum)
  @IsOptional()
  readonly status?: StatusEnum;

  @IsArray()
  @IsOptional()
  readonly contacts?: Array<IContacts>;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsEnum(AvgCheckEnum)
  @IsOptional()
  readonly avgCheck?: AvgCheckEnum;

  @IsObject()
  readonly address: IAddress;

  @IsString()
  @IsOptional()
  readonly preview?: string;
}
