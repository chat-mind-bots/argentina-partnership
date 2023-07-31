import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';
import { ChangeRoles } from 'src/rights-change/types';

export type Status = 'resolve' | 'reject' | 'pending';

export type RightsChangeDocument = RightsChange & Document;

@Schema()
export class RightsChange {
  @Prop()
  tg_id: number;

  @Prop()
  role: ChangeRoles;

  @Prop()
  status: Status;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const RightsChangeSchema = SchemaFactory.createForClass(RightsChange);
