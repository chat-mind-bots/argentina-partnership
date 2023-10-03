import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { toNumber } from 'src/common/helpers/query.helper';
import { CurrenciesEnum } from 'src/payment/enums/currencies.enum';
import { PaymentStatusEnum } from 'src/payment/enums/payment-status.enum';
export class GetUserPaymentsQueryDto {
  @Transform(({ value }) => toNumber(value, { default: 5, min: 1, max: 15 }))
  @IsNumber()
  readonly limit: number;

  @Transform(({ value }) => toNumber(value, { default: 0, min: 0 }))
  @IsNumber()
  readonly offset: number;

  @IsString()
  @IsOptional()
  @IsEnum(CurrenciesEnum)
  readonly currency?: CurrenciesEnum;

  @IsString()
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  readonly status?: PaymentStatusEnum;
}
