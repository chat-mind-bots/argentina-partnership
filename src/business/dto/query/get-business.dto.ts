import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  toBoolean,
  toLowerCase,
  toNumber,
  trim,
} from 'src/common/helpers/query.helper';

export class GetBusinessDto {
  @Transform(({ value }) => toNumber(value, { default: 5, min: 1, max: 50 }))
  @IsNumber()
  readonly limit: number;

  @Transform(({ value }) => toNumber(value, { default: 0, min: 0 }))
  @IsNumber()
  readonly offset: number;

  @Transform(({ value }) => trim(toLowerCase(value)))
  @IsString()
  @IsOptional()
  readonly q?: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly 'has-owner'?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly category?: string;

  @Transform(({ value }) => trim(toLowerCase(value)))
  @IsString()
  @IsOptional()
  readonly 'sort-order'?: 'asc' | 'desc';
}
