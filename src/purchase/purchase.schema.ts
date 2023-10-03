import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, SchemaTypes, Types } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Balance } from 'src/balance/balance.schema';
import { Tariff } from 'src/tariff/tariff.schema';

export type PurchaseDocument = Purchase & Document;

export interface PurchaseItem {
  item: string;
  priceWithSale?: number;
}

@Schema()
export class Purchase {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: User.name })
  user: Types.ObjectId;
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Balance.name })
  balance: Types.ObjectId;
  @Prop({ required: true, type: Number })
  totalPay: number;
  @Prop({ required: false, type: Number })
  total: number;
  @Prop({
    required: true,
    type: [
      {
        item: { type: Types.ObjectId, required: true, ref: Tariff.name },
        priceWithSale: { type: Number, required: false },
      },
    ],
  })
  items: Array<PurchaseItem>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
