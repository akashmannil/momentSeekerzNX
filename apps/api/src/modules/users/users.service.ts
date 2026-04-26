import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

interface CreateUserDto {
  email: string;
  name: string;
  passwordHash: string;
  role?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already registered');

    const user = new this.userModel(dto);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    // Select passwordHash explicitly since it's excluded by default
    return this.userModel
      .findOne({ email: email.toLowerCase(), isActive: true })
      .select('+passwordHash')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ isActive: true }).exec();
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
  }

  async deactivate(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    await user.save();
  }

  async updateSubscription(
    userId: string,
    patch: Partial<{
      tier: string | null;
      status: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
    }>
  ): Promise<UserDocument | null> {
    const $set: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      $set[`subscription.${k}`] = v;
    }
    return this.userModel.findByIdAndUpdate(userId, { $set }, { new: true }).exec();
  }

  async findByStripeCustomerId(customerId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 'subscription.stripeCustomerId': customerId }).exec();
  }
}
