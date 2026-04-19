import { PricingTier, ServiceCategory, SessionType } from '../enums';

export interface PricingPlan {
  tier: PricingTier;
  name: string;
  monthlyPrice: number;
  currency: 'CAD';
  tagline: string;
  highlights: string[];
  turnaround: string;
  featured?: boolean;
}

export interface ServiceOffering {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  startingPrice: number;
  currency: 'CAD';
  salePrice?: number;
  unit?: string;
  sessionType?: SessionType;
}
