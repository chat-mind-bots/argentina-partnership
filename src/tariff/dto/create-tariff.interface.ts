import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTariffDto {
  @IsString()
  readonly title: string;

  @IsNumber()
  readonly price: number;

  @IsNumber()
  readonly period: number;

  @IsNumber()
  @IsOptional()
  readonly salePercent?: number;

  @IsOptional()
  readonly description?: string;
}
