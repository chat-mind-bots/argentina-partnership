import { StatusEnum } from 'src/cryptomus/interfaces/status.enum';

export interface CryptomusPaymentCallbackDto {
  type: string;
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payment_amount_usd: string;
  merchant_amount: string;
  commission: string;
  is_final: boolean;
  status: StatusEnum;
  from: any;
  wallet_address_uuid: string;
  network: string;
  currency: string;
  payer_currency: string;
  additional_data: any;
  sign: string;
}
