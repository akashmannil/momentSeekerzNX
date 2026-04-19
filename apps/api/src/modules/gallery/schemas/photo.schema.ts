import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PhotoCategory } from '@sm/shared';

export type PhotoDocument = Photo & Document;

@Schema({ timestamps: true, collection: 'photos' })
export class Photo {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop()
  webpUrl?: string;

  @Prop({ required: true, type: String, enum: Object.values(PhotoCategory) })
  category!: PhotoCategory;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ default: true })
  published!: boolean;

  @Prop({ type: Object })
  metadata?: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    location?: string;
    dateTaken?: Date;
    width?: number;
    height?: number;
  };

  @Prop({ default: 0 })
  viewCount!: number;

  @Prop({ default: 0 })
  sortOrder!: number;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);

// Full-text search index on title, description, tags
PhotoSchema.index({ title: 'text', description: 'text', tags: 'text' });
PhotoSchema.index({ category: 1, published: 1, sortOrder: 1 });
PhotoSchema.index({ featured: 1, published: 1 });
