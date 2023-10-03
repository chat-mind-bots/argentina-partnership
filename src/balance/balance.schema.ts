import { Document, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BalanceDocument = Balance & Document;

@Schema()
export class Balance {
  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  amount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
