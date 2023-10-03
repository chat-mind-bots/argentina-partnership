import { now, Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Payment } from 'src/payment/payment.schema';
import { StatusEnum } from 'src/cryptomus/interfaces/status.enum';
import { Result } from 'src/cryptomus/interfaces/create-payment-result.interface';

export type CategoryDocument = Cryptomus & Document;

export class CryptomusResult extends Document {
  @Prop({ required: true, type: String })
  uuid: string;

  @Prop({ required: true, type: Types.ObjectId, ref: Payment.name })
  order_id: Types.ObjectId;

  @Prop({ required: true, type: String })
  amount: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  network: string;

  @Prop({ required: true, type: String })
  url: string;

  @Prop({ required: true })
  is_final: boolean;

  @Prop({ required: true, type: Number })
  expired_at: number;

  @Prop({ required: true, enum: StatusEnum })
  status: StatusEnum;

  @Prop({ required: true, enum: StatusEnum })
  payment_amount: StatusEnum;
}

@Schema()
export class Cryptomus {
  @Prop({ required: true })
  state: number;

  @Prop({ required: true, type: CryptomusResult })
  result: Result;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CryptomusSchema = SchemaFactory.createForClass(Cryptomus);
