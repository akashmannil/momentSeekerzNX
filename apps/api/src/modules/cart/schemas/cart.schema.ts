import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class CartItem {
  @Prop({ required: true })
  serviceId!: string;

  @Prop({ required: true, min: 1, max: 20 })
  quantity!: number;

  @Prop({ required: true })
  addedAt!: Date;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

export type CartDocument = Cart & Document;

@Schema({ timestamps: true, collection: 'carts' })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', sparse: true, index: true })
  userId?: string;

  @Prop({ index: true, sparse: true })
  guestSid?: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItem[];

  @Prop({ type: Date, default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) })
  expiresAt!: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
CartSchema.index({ guestSid: 1 }, { unique: true, partialFilterExpression: { guestSid: { $exists: true } } });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
