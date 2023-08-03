import { HydratedDocument, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
