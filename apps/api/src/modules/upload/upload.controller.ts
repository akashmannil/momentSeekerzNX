import {
  Controller, Post, Delete, Param,
  UseInterceptors, UploadedFile, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({ path: 'upload', version: '1' })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep in buffer; Sharp handles disk write
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload and process a photo (admin only)' })
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadPhoto(file);
  }

  @Delete('photo/:filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete photo and its derivatives' })
  async deletePhoto(@Param('filename') filename: string) {
    return this.uploadService.deletePhoto(filename);
  }
}
