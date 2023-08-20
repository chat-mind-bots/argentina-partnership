import {
  BadRequestException,
  Body,
  Controller,
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
      throw new BadRequestException(req.fileValidationError || 'Invalid file');
    }
    return this.fileService.uploadImage(
      file.buffer,
      file.originalname,
      file.size,
      body.userId,
    );
  }
}
