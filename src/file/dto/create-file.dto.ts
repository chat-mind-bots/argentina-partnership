import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  e_tag: string;

  @IsString()
  key: string;

  @IsString()
  @IsOptional()
  bucket?: string;

  @IsString()
  domain: string;

  @IsNumber()
  file_size: number;
}
