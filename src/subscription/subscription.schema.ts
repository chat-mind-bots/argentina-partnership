import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, SchemaTypes, Types } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Tariff } from 'src/tariff/tariff.schema';
import { Purchase } from 'src/purchase/purchase.schema';

export type SubscriptionDocument = Subscription & Document;

@Schema()
export class Subscription {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: User.name })
  user: Types.ObjectId;
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Tariff.name })
  tariff: Types.ObjectId;
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Purchase.name })
  purchase: Types.ObjectId;

  @Prop({ required: false, type: Date })
  expiredDate: Date;

  @Prop({ default: now() })
  createdAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
