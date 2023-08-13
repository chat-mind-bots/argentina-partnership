import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now, Types } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Category } from 'src/categories/ctegories.schema';

export type BusinessDocument = HydratedDocument<Business>;

@Schema()
export class Business {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  owner: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  contacts: string;

  @Prop({ required: true, type: Types.ObjectId, ref: Category.name })
  category: Types.ObjectId;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  preview: string;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
