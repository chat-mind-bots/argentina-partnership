import { Document, now, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { CurrenciesEnum } from 'src/payment/enums/currencies.enum';
import { PaymentStatusEnum } from 'src/payment/enums/payment-status.enum';
import { Balance } from 'src/balance/balance.schema';
import { NetworksEnum } from 'src/payment/enums/networks.enum';
import { PaymentTypeEnum } from 'src/payment/enums/payment-type.enum';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Balance.name })
  balance: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({
    required: true,
    type: String,
    enum: CurrenciesEnum,
    default: CurrenciesEnum.USDT,
  })
  currency: CurrenciesEnum;

  @Prop({
    required: true,
    type: String,
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum;

  @Prop({
    required: false,
    type: String,
    enum: NetworksEnum,
  })
  method?: NetworksEnum;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.Mixed,
  })
  data?: any;

  @Prop({
    required: false,
    type: String,
    enum: PaymentTypeEnum,
  })
  paymentType: PaymentTypeEnum;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
