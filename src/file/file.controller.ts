import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
import { imageFileFilter } from 'src/file/validators/image.validator';
import { UploadBodyDto } from 'src/file/dto/upload-body.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20971520,
      },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadImage(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() body: UploadBodyDto,
    @Req() req,
  ) {
    if (!file || req.fileValidationError) {
      throw new HttpException('File not an image', HttpStatus.NOT_ACCEPTABLE);
      // throw new HttpException('User not partner', HttpStatus.NOT_ACCEPTABLE);
    }

    if (!body.userId) {
      throw new HttpException('Invalid userId', HttpStatus.NOT_ACCEPTABLE);
    }

    return this.fileService.uploadImage(
      file.buffer,
      file.originalname,
      file.size,
      body.userId,
    );
  }
}
