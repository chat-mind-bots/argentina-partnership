import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';
import { IContacts } from 'src/business/interfaces/contacts.interface';
import { IAddress } from 'src/business/interfaces/address.interface';

export class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  readonly category?: string;

  @IsString()
  @IsOptional()
  readonly title?: string;

  @IsArray()
  @IsOptional()
  readonly contacts?: Array<IContacts>;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsObject()
  readonly address: IAddress;

  @IsString()
  @IsOptional()
  readonly preview?: string;
}
