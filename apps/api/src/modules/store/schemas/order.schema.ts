import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { OrderStatus } from '@mss/shared';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber!: string;

  @Prop({ required: true })
  customerEmail!: string;

  @Prop({ required: true })
  customerName!: string;

  @Prop({
    type: [
      {
        productId: { type: MongooseSchema.Types.ObjectId, ref: 'Product' },
        title: String,
        imageUrl: String,
        size: String,
        finish: String,
        quantity: Number,
        unitPrice: Number,
        sku: String,
      },
    ],
  })
  items!: Array<{
    productId: MongooseSchema.Types.ObjectId;
    title: string;
    imageUrl: string;
    size: string;
    finish: string;
    quantity: number;
    unitPrice: number;
    sku: string;
  }>;

  @Prop({ required: true })
  subtotal!: number;

  @Prop({ default: 0 })
  shippingCost!: number;

  @Prop({ default: 0 })
  tax!: number;

  @Prop({ required: true })
  total!: number;

  @Prop({ type: Object, required: true })
  shippingAddress!: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({ default: OrderStatus.PENDING, enum: Object.values(OrderStatus) })
  status!: OrderStatus;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop()
  stripeSessionId?: string;

  @Prop()
  trackingNumber?: string;

  @Prop()
  adminNotes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
