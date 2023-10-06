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
  ) {
    return this.uploadFile(
      dataBuffer,
      filename,
      fileSize,
      userId,
      process.env.S3_IMAGE_BUCKET,
    );
  }

  async uploadFile(
    dataBuffer: Buffer,
    filename: string,
    fileSize: number,
    userId: number,
    bucket?: string,
  ) {
    const key = `${uuidv4()}_${extname(filename)}`;
    const putObject = new PutObjectCommand({
      Bucket: bucket,
      Body: dataBuffer,
      Key: key,
    });

    const uploadResult = await this.s3.send(putObject);
    const dto: CreateFileDto = {
      e_tag: uploadResult.ETag,
      key: key,
      bucket: bucket,
      domain: process.env.S3_DOMAIN,
      file_size: fileSize,
    };

    const file = await this.createNewFile(dto, userId);

    return {
      file,
    };
  }

  async createNewFile(dto: CreateFileDto, userId: number) {
    const user = await this.userService.findByTgId(userId);
    const file = await this.fileModel.create({
      ...dto,
      owner: new Types.ObjectId(user.id),
    });
    return file;
  }

  async findFile(fileId: string) {
    return this.fileModel.findById(fileId);
  }
}
