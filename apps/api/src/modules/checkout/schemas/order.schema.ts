import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { OrderStatus } from '@sm/shared';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true }) serviceId!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true, min: 1 }) quantity!: number;
  @Prop({ required: true, min: 0 }) unitPriceCents!: number;
  @Prop({ default: false }) requiresScheduling!: boolean;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderNumber!: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  customerEmail!: string;

  @Prop()
  customerName?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', sparse: true, index: true })
  userId?: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items!: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotalCents!: number;

  @Prop({ required: true, min: 0 })
  totalCents!: number;

  @Prop({ default: 'CAD', enum: ['CAD'] })
  currency!: string;

  @Prop({ type: String, required: true, enum: Object.values(OrderStatus), default: OrderStatus.PENDING, index: true })
  status!: OrderStatus;

  @Prop({ index: true, unique: true, sparse: true })
  stripeSessionId?: string;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop({ index: true, unique: true, sparse: true })
  stripeEventId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
