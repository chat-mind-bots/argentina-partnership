import { CurrencyInterface } from 'src/cryptomus/interfaces/currency.interface';

export interface CreatePaymentResult {
  state: number;
  result: Result;
}
export interface Result {
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payer_amount: string;
  payer_currency: string;
  currency: string;
  network: string;
  payment_status: string;
  url: string;
  expired_at: number;
  status: string;
  is_final: boolean;
  currencies: CurrencyInterface[];
}
