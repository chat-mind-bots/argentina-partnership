import { Document, now, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { UserCodeStatusEnum } from 'src/user-codes/enums/user-code-status.enum';

export type UserCodesDocument = UserCodes & Document;

@Schema()
export class UserCodes {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true, type: String })
  code: string;

  @Prop({ required: true, type: Number })
  status: UserCodeStatusEnum;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const UserCodesSchema = SchemaFactory.createForClass(UserCodes);
