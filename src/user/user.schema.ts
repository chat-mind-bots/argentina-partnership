import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  balance: number;

  @Prop()
  refCode: string;

  @Prop()
  refId: number;

  @Prop({
    default: [UserRoleEnum.USER],
    type: [String],
  })
  role: UserRoleEnum[];
}

export const UserSchema = SchemaFactory.createForClass(User);
