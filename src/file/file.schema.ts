import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now, Types } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Business } from 'src/business/business.schema';

export type FileDocument = File & Document;

@Schema()
export class File {
  @Prop({ required: true })
  e_tag: string;

  @Prop({
    required: true,
    type: String,
  })
  url: string;

  @Prop({
    required: true,
    type: String,
  })
  key: string;

  @Prop({
    required: true,
    type: String,
  })
  bucket: string;

  @Prop({
    required: true,
    type: String,
  })
  domain: string;

  @Prop({
    required: true,
    type: Number,
  })
  file_size: number;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  owner: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Business.name })
  business: Types.ObjectId;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
