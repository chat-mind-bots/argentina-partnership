import { Document, now, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { Balance } from 'src/balance/balance.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: Balance.name,
  })
  balance: Types.ObjectId;

  @Prop({
    required: true,
  })
  tg_id: number;

  @Prop({
    required: false,
  })
  username: string;

  @Prop({
    required: true,
  })
  first_name: string;

  // @Prop({
  //   required: true,
  // })
  // refCode: string;

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

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
