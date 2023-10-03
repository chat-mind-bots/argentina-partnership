import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

export type TariffDocument = Tariff & Document;

@Schema()
export class Tariff {
  @Prop({ required: true, type: String })
  title: string;
  @Prop({ required: true, type: Number })
  price: number;
  @Prop({ required: true, type: Number })
  period: number;
  @Prop({ required: false, type: Number })
  salePercent?: number;
  @Prop({ required: false, type: String })
  description?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TariffSchema = SchemaFactory.createForClass(Tariff);
