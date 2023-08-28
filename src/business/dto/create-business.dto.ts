import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { IContacts } from 'src/business/interfaces/contacts.interface';
import { IAddress } from 'src/business/interfaces/address.interface';

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

  @IsNumber()
  @IsOptional()
  readonly avgCheck?: number;

  @IsString()
  @IsOptional()
  readonly preview?: string;

  @IsObject()
  readonly address: IAddress;
}
