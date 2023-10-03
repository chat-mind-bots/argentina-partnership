import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CurrenciesEnum } from 'src/payment/enums/currencies.enum';
import { NetworksEnum } from 'src/payment/enums/networks.enum';
import { PaymentTypeEnum } from 'src/payment/enums/payment-type.enum';

export class CreatePaymentDto {
  @IsNumber()
  readonly amount: number;

  @IsString()
  @IsEnum(CurrenciesEnum)
  readonly currency: CurrenciesEnum;

  @IsString()
  @IsOptional()
  @IsEnum(NetworksEnum)
  readonly method?: NetworksEnum;

  @IsString()
  @IsOptional()
  @IsEnum(PaymentTypeEnum)
  readonly paymentType?: PaymentTypeEnum;
}
