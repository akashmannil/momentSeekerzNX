import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    // Serve uploaded files as static assets at /api/uploads/*
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          rootPath: path.resolve(config.get<string>('UPLOAD_DEST', './uploads')),
          serveRoot: '/api/uploads',
          serveStaticOptions: {
            maxAge: 31536000, // 1 year cache
            index: false,
          },
        },
      ],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
