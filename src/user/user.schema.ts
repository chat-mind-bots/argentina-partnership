import { Document, now, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({
    required: true,
  })
  balance: number;

  @Prop({
    required: true,
  })
  tg_id: number;

  @Prop({
    required: true,
  })
  refCode: string;

  @Prop({
    required: false,
  })
  refId: Types.ObjectId;

  @Prop({
    required: true,
    default: [UserRoleEnum.USER],
    type: [String],
  })
  role: UserRoleEnum[];

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
