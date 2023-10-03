import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  toBoolean,
  toLowerCase,
  toNumber,
  trim,
} from 'src/common/helpers/query.helper';
import { BusinessByEnum } from 'src/business/enum/sort-by.enum';
import { StatusEnum } from 'src/business/enum/status.enum';

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

  @IsOptional()
  readonly category?: string;

  @IsEnum(StatusEnum)
  @IsOptional()
  readonly status?: StatusEnum;

  @Transform(({ value }) => trim(toLowerCase(value)))
  @IsString()
  @IsOptional()
  readonly 'sort-order'?: 'asc' | 'desc';

  @IsEnum(BusinessByEnum)
  @IsOptional()
  readonly 'sort-by'?: BusinessByEnum;
}
