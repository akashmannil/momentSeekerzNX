import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Photo, PhotoDocument } from './schemas/photo.schema';
import { CreatePhotoDto, UpdatePhotoDto, GalleryQueryDto } from '@sm/shared';

export interface PaginatedPhotos {
  data: PhotoDocument[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable()
export class GalleryService {
  constructor(@InjectModel(Photo.name) private photoModel: Model<PhotoDocument>) {}

  async create(dto: CreatePhotoDto): Promise<PhotoDocument> {
    const photo = new this.photoModel(dto);
    return photo.save();
  }

  async findAll(query: GalleryQueryDto): Promise<PaginatedPhotos> {
    const {
      page = 1,
      limit = 20,
      category,
      featured,
      search,
      tag,
      published = true,
    } = query;

    const filter: Record<string, unknown> = { published };
    if (category) filter['category'] = category;
    if (featured !== undefined) filter['featured'] = featured;
    if (tag) filter['tags'] = { $in: [tag] };
    if (search) filter['$text'] = { $search: search };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.photoModel.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.photoModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findFeatured(limit = 6): Promise<PhotoDocument[]> {
    return this.photoModel
      .find({ featured: true, published: true })
      .sort({ sortOrder: 1 })
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<PhotoDocument> {
    const photo = await this.photoModel.findById(id).exec();
    if (!photo) throw new NotFoundException(`Photo ${id} not found`);
    // Increment view count in background
    this.photoModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
    return photo;
  }

  async update(id: string, dto: UpdatePhotoDto): Promise<PhotoDocument> {
    const photo = await this.photoModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!photo) throw new NotFoundException(`Photo ${id} not found`);
    return photo;
  }

  async remove(id: string): Promise<void> {
    const result = await this.photoModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Photo ${id} not found`);
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.photoModel.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
  }

  async bulkUpdateOrder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    const ops = updates.map(u => ({
      updateOne: { filter: { _id: u.id }, update: { sortOrder: u.sortOrder } },
    }));
    await this.photoModel.bulkWrite(ops);
  }
}
