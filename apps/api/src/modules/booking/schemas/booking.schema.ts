import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BookingStatus, SessionType } from '@sm/shared';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  @Prop({ required: true, trim: true })
  clientName!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  clientEmail!: string;

  @Prop({ required: true })
  clientPhone!: string;

  @Prop({ required: true, type: String, enum: Object.values(SessionType) })
  sessionType!: SessionType;

  @Prop({ required: true })
  preferredDate!: Date;

  @Prop()
  alternateDate?: Date;

  @Prop({ trim: true })
  location?: string;

  @Prop({ trim: true })
  message?: string;

  @Prop({
    type: String,
    default: BookingStatus.PENDING,
    enum: Object.values(BookingStatus),
  })
  status!: BookingStatus;

  @Prop()
  adminNotes?: string;

  @Prop()
  quotedPrice?: number;

  @Prop()
  confirmedDate?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ clientEmail: 1 });
BookingSchema.index({ status: 1, preferredDate: 1 });
