import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, Types, HydratedDocument } from 'mongoose';
import { ChangeRoles } from 'src/rights-change/types';
import { User } from 'src/user/user.schema';

export enum TicketStatus {
  RESOLVE = 'resolve',
  REJECT = 'reject',
  PENDING = 'pending',
}

export type RightsChangeDocument = HydratedDocument<RightsChange>;

@Schema()
export class RightsChange {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true })
  role: ChangeRoles;

  @Prop({ required: true })
  status: TicketStatus;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const RightsChangeSchema = SchemaFactory.createForClass(RightsChange);
