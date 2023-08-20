import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now, Types, Document } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Category } from 'src/categories/ctegories.schema';
import { IContacts } from 'src/business/interfaces/contacts.interface';
import { IAddress } from 'src/business/interfaces/address.interface';
import { File } from 'src/file/file.schema';

export type BusinessDocument = HydratedDocument<Business>;

@Schema()
export class Address extends Document {
  @Prop({ required: true })
  isExist: boolean;
  @Prop({ required: false })
  addressLine: string;
  @Prop({ required: false })
  googleMapsLink: string;
  @Prop({ required: false })
  comment: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
@Schema()
export class Business {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  owner: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  contacts: Array<IContacts>;

  @Prop({ required: true, type: Types.ObjectId, ref: Category.name })
  category: Types.ObjectId;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true, type: AddressSchema })
  address: IAddress;

  @Prop({ required: false, type: Types.ObjectId, ref: File.name })
  preview: Types.ObjectId;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
