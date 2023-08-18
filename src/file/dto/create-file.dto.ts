import { IsNumber, IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  e_tag: string;

  @IsString()
  key: string;

  @IsString()
  bucket: string;

  @IsString()
  url: string;

  @IsString()
  domain: string;

  @IsNumber()
  file_size: number;
}
