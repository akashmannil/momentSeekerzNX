import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Photo } from '../gallery/schemas/photo.schema';
import { Booking } from '../booking/schemas/booking.schema';
import { Order } from '../checkout/schemas/order.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Photo.name) private photoModel: Model<any>,
    @InjectModel(Booking.name) private bookingModel: Model<any>,
    @InjectModel(Order.name) private orderModel: Model<any>
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalPhotos,
      totalBookings,
      pendingBookings,
      recentOrders,
      topPhotos,
      bookingsByStatus,
      revenueThisMonth,
    ] = await Promise.all([
      this.photoModel.countDocuments({ published: true }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: 'pending' }),
      this.orderModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      this.photoModel
        .find({ published: true })
        .sort({ viewCount: -1 })
        .limit(5)
        .select('title viewCount category thumbnailUrl'),
      this.bookingModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalCents' }, count: { $sum: 1 } } },
      ]),
    ]);

    const revenue = revenueThisMonth[0] ?? { total: 0, count: 0 };

    return {
      summary: {
        totalPhotos,
        totalBookings,
        pendingBookings,
        recentOrders,
        revenueThisMonth: Math.round(revenue.total) / 100,
        ordersThisMonth: revenue.count,
      },
      topPhotos,
      bookingsByStatus,
    };
  }

  async getRevenueByMonth(months = 6) {
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    return this.orderModel.aggregate([
      { $match: { createdAt: { $gte: start }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenueCents: { $sum: '$totalCents' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          label: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
            ],
          },
          revenue: { $divide: ['$revenueCents', 100] },
          orders: 1,
          _id: 0,
        },
      },
    ]);
  }
}
