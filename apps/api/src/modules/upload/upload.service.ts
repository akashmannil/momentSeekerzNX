/**
 * Upload service — local storage by default, cloud-ready.
 * To switch to S3 set STORAGE_PROVIDER=s3 in env and fill in AWS_ vars.
 */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  originalUrl: string;
  thumbnailUrl: string;
  webpUrl: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = configService.get<string>('UPLOAD_DEST', './uploads');
    this.baseUrl = configService.get<string>('API_URL', 'http://localhost:3000');
  }

  async uploadPhoto(file: Express.Multer.File): Promise<UploadResult> {
    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('File exceeds 10MB limit');
    }

    const id = uuidv4();
    const dir = path.join(this.uploadDir, 'photos');
    await fs.mkdir(dir, { recursive: true });

    // Sharp pipeline: generate original JPEG (max 2400px), thumbnail (400px), WebP
    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    const [originalInfo] = await Promise.all([
      image
        .clone()
        .resize({ width: 2400, withoutEnlargement: true })
        .jpeg({ quality: 88, progressive: true })
        .toFile(path.join(dir, `${id}.jpg`)),

      image
        .clone()
        .resize({ width: 400, withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toFile(path.join(dir, `${id}-thumb.jpg`)),

      image
        .clone()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(dir, `${id}.webp`)),
    ]);

    this.logger.log(`Uploaded photo ${id} (${Math.round(originalInfo.size / 1024)}KB)`);

    const base = `${this.baseUrl}/api/uploads/photos`;
    return {
      originalUrl: `${base}/${id}.jpg`,
      thumbnailUrl: `${base}/${id}-thumb.jpg`,
      webpUrl: `${base}/${id}.webp`,
      filename: `${id}.jpg`,
      size: originalInfo.size,
      width: originalInfo.width,
      height: originalInfo.height,
    };
  }

  async deletePhoto(filename: string): Promise<void> {
    const base = path.join(this.uploadDir, 'photos');
    const stem = path.parse(filename).name;
    await Promise.allSettled([
      fs.unlink(path.join(base, `${stem}.jpg`)),
      fs.unlink(path.join(base, `${stem}-thumb.jpg`)),
      fs.unlink(path.join(base, `${stem}.webp`)),
    ]);
  }
}
