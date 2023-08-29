import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { PaymentStatusEnum } from 'src/payment/enums/payment-status.enum';

export class UpdatePaymentDto {
  @IsString()
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  readonly status?: PaymentStatusEnum;

  @IsOptional()
  @IsObject()
  readonly data?: object;
}
