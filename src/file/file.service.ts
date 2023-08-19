import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { File, FileDocument } from 'src/file/file.schema';
import { InjectS3, S3 } from 'nestjs-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFileDto } from 'src/file/dto/create-file.dto';
import { extname } from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { BusinessService } from 'src/business/business.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FileService {
  constructor(
    @InjectS3() private readonly s3: S3,
    @InjectModel(File.name)
    private readonly fileModel: Model<FileDocument>,
    @Inject(forwardRef(() => BusinessService))
    private readonly businessService: BusinessService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createBucket() {
    await this.s3.createBucket({ Bucket: 'bucket' });
    return this.getBucketList();
  }
  async getBucketList() {
    const list = await this.s3.listBuckets({});
    return list.Buckets;
  }

  async uploadImage(
    dataBuffer: Buffer,
    filename: string,
    fileSize: number,
    userId: number,
    businessId: string,
  ) {
    return this.uploadFile(
      dataBuffer,
      filename,
      fileSize,
      userId,
      businessId,
      process.env.S3_IMAGE_BUCKET,
    );
  }

  async uploadFile(
    dataBuffer: Buffer,
    filename: string,
    fileSize: number,
    userId: number,
    businessId: string,
    bucket: string,
  ) {
    const key = `${uuidv4()}_${extname(filename)}`;
    const putObject = new PutObjectCommand({
      Bucket: bucket,
      Body: dataBuffer,
      Key: key,
    });

    const uploadResult = await this.s3.send(putObject);
    const url = `${process.env.S3_DOMAIN}/${bucket}/${key}`;

    const dto: CreateFileDto = {
      e_tag: uploadResult.ETag,
      key: key,
      bucket: bucket,
      domain: process.env.S3_DOMAIN,
      file_size: fileSize,
      url,
    };

    await this.createNewFile(dto, userId, businessId);
    const business = await this.businessService.findBusinessByIdClear(
      businessId,
    );
    //TODO: добавить проверку на совпадение userID и businessOwnerID
    await this.businessService.updateBusiness(businessId, {
      ...business['_doc'],
      preview: url,
    });
    return {
      key: key,
      url,
    };
  }

  // async getFile(key: string) {
  //   const response = await this.s3
  //     .getObject({
  //       Bucket: process.env.S3_DOCUMENTS_BUCKET,
  //       Key: key,
  //     })
  //     .promise();
  //   return response.Body;
  // }

  async createNewFile(dto: CreateFileDto, userId: number, businessId: string) {
    const user = await this.userService.findByTgId(userId);
    await this.fileModel.create({
      ...dto,
      owner: new Types.ObjectId(user.id),
      business: new Types.ObjectId(businessId),
    });
  }
}
