import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { IContacts } from 'src/business/interfaces/contacts.interface';
import { IAddress } from 'src/business/interfaces/address.interface';
import { AvgCheckEnum } from 'src/business/enum/avg-check.enum';
import { CurrenciesEnum } from 'src/payment/enums/currencies.enum';

export class CreateBusinessDto {
  @IsString()
  readonly categoryId: string;

  @IsString()
  readonly title: string;

  @IsArray()
  readonly contacts: Array<IContacts>;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsEnum(AvgCheckEnum)
  @IsOptional()
  readonly avgCheck?: AvgCheckEnum;

  @IsString()
  @IsOptional()
  readonly preview?: string;

  @IsObject()
  readonly address: IAddress;
}
