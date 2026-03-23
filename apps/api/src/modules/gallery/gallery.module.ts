import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Photo, PhotoSchema } from './schemas/photo.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }])],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
