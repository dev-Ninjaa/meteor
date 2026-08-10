import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { StorageService, UploadResult } from './storage.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to IPFS (Pinata)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: MulterFile): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 50MB');
    }

    this.logger.log(`Uploading file: ${file.originalname} (${file.size} bytes)`);

    const result = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    this.logger.log(`File uploaded successfully: ${result.url}`);
    return result;
  }

  @Post('upload-multiple')
  @UseInterceptors(FileInterceptor('files'))
  @ApiOperation({ summary: 'Upload multiple files to IPFS' })
  @ApiConsumes('multipart/form-data')
  async uploadMultipleFiles(@UploadedFile() files: MulterFile[]): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = await Promise.all(
      files.map((file) =>
        this.storageService.uploadFile(file.buffer, file.originalname, file.mimetype)
      )
    );

    return results;
  }
}