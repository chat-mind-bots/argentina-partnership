import { IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  readonly userId: string;
  @IsString()
  readonly tariff: string;
  @IsNumber()
  readonly period: number;
  @IsString()
  readonly purchase: string;
}
