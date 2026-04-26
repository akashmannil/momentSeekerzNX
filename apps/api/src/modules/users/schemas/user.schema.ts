import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PricingTier, SubscriptionStatus } from '@sm/shared';

@Schema({ _id: false })
export class UserSubscription {
  @Prop({ type: String, enum: Object.values(PricingTier), default: null })
  tier?: PricingTier | null;

  @Prop({ type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.NONE })
  status!: SubscriptionStatus;

  @Prop()
  stripeCustomerId?: string;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop()
  currentPeriodEnd?: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd?: boolean;
}

export const UserSubscriptionSchema = SchemaFactory.createForClass(UserSubscription);

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role!: string;

  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: UserSubscriptionSchema, default: () => ({ status: SubscriptionStatus.NONE, tier: null }) })
  subscription?: UserSubscription;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    if (ret.subscription) {
      delete ret.subscription.stripeCustomerId;
      delete ret.subscription.stripeSubscriptionId;
    }
    return ret;
  },
});
