import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto, UpdateBookingDto } from '@sm/shared';
import { BookingStatus } from '@sm/shared';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>
  ) {}

  async create(dto: CreateBookingDto): Promise<BookingDocument> {
    const booking = new this.bookingModel(dto);
    return booking.save();
  }

  async findAll(status?: BookingStatus): Promise<BookingDocument[]> {
    const filter = status ? { status } : {};
    return this.bookingModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Booking ${id} not found`);
  }

  async getStats(): Promise<{ status: string; count: number }[]> {
    return this.bookingModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);
  }
}
