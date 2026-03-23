import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PrintSize, PrintFinish } from '@mss/shared';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop()
  thumbnailUrl?: string;

  /** Reference to the gallery photo this print is based on */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Photo' })
  photoId?: MongooseSchema.Types.ObjectId;

  /** Available size/finish/price combinations */
  @Prop({
    type: [
      {
        size: { type: String, enum: Object.values(PrintSize) },
        finish: { type: String, enum: Object.values(PrintFinish) },
        price: Number,
        stock: { type: Number, default: -1 }, // -1 = unlimited (print-on-demand)
        sku: String,
      },
    ],
    default: [],
  })
  variants!: Array<{
    size: PrintSize;
    finish: PrintFinish;
    price: number;
    stock: number;
    sku: string;
  }>;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: true })
  published!: boolean;

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ default: 0 })
  salesCount!: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ published: 1, featured: 1 });
