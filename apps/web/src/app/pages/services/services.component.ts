import { Component } from '@angular/core';
import { ServiceCategory, SessionType } from '@sm/shared';

interface CategoryBlock {
  key: ServiceCategory;
  title: string;
  lede: string;
  services: {
    name: string;
    description: string;
    sessionType?: SessionType;
    startingPrice?: string;
  }[];
}

@Component({
  selector: 'sm-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent {
  readonly categories: CategoryBlock[] = [
    {
      key: ServiceCategory.CORE_VISUAL,
      title: 'Core Visual',
      lede: 'Photo and video production for the foundation of your brand.',
      services: [
        {
          name: 'Real Estate Elite Pack',
          description: 'High-impact photo + video coverage for realtors, developers, and short-term rentals.',
          sessionType: SessionType.REAL_ESTATE,
          startingPrice: 'From CA$250',
        },
        {
          name: 'Product / Brand Photography',
          description: 'Perfectly lit, styled, and edited imagery that elevates your store.',
          sessionType: SessionType.PRODUCT_BRAND,
          startingPrice: 'From CA$250',
        },
        {
          name: 'Personal & Team Portraits',
          description: 'Editorial portraits for founders, teams, and talent.',
          sessionType: SessionType.PORTRAIT,
          startingPrice: 'From CA$200',
        },
        {
          name: 'Drone & Aerial Shoots',
          description: 'Certified aerial coverage for properties, events, and cinematic B-roll.',
          sessionType: SessionType.DRONE_AERIAL,
          startingPrice: 'From CA$300',
        },
        {
          name: '360° Virtual Tours',
          description: 'Immersive walkthroughs for real estate, venues, and experiences.',
          sessionType: SessionType.VIRTUAL_TOUR,
          startingPrice: 'From CA$350',
        },
        {
          name: 'Cinematic Campaign Package',
          description: 'High-end campaigns combining photo, film, and creative direction.',
          sessionType: SessionType.CORPORATE_CAMPAIGN,
          startingPrice: 'From CA$700',
        },
      ],
    },
    {
      key: ServiceCategory.ADVANCED_TOOLS,
      title: 'Advanced Visual Tools',
      lede: 'Motion, 3D, and post-production tools that push your content further.',
      services: [
        {
          name: 'Vertical Reels (IG / TikTok / Shorts)',
          description: 'Trend-driven short-form video that earns the scroll.',
          sessionType: SessionType.VERTICAL_REEL,
          startingPrice: 'From CA$120',
        },
        {
          name: 'Cinematic Promo Videos',
          description: 'Hero brand films for launches, websites, and campaigns.',
          sessionType: SessionType.CINEMATIC_VIDEO,
          startingPrice: 'From CA$600',
        },
        {
          name: 'Website Hero Video Banners',
          description: 'Looping hero video for homepages and landing pages.',
          startingPrice: 'From CA$200',
        },
        {
          name: 'Logo Animations / Intros',
          description: 'Motion idents for video, streams, and presentations.',
          startingPrice: 'From CA$180',
        },
        {
          name: 'Virtual Mockups & Staging',
          description: 'Photoreal product mockups and virtual property staging.',
          startingPrice: 'From CA$120',
        },
        {
          name: '3D Concept Visualization',
          description: 'Concept renders for pitch decks, launches, and architecture.',
          startingPrice: 'From CA$400',
        },
        {
          name: 'Colour Grading & Styling',
          description: 'Cinematic colour grading for photo and video.',
          startingPrice: 'From CA$90',
        },
        {
          name: 'Sky / Background Replacement',
          description: 'Clean, on-brand backgrounds across an image set.',
          startingPrice: 'From CA$60',
        },
      ],
    },
    {
      key: ServiceCategory.MARKETING_BRANDING,
      title: 'Marketing & Branding',
      lede: 'Content that builds your brand and pushes it to market.',
      services: [
        {
          name: 'Influencer Social Kit',
          description: 'Content packaged for creators and influencer partnerships.',
          startingPrice: 'From CA$249',
        },
        {
          name: 'Corporate Identity Suite',
          description: 'Brand visuals aligned across team, product, and marketing.',
          startingPrice: 'From CA$299',
        },
        {
          name: 'Event Momentum Package',
          description: 'Full promo engine for events, launches, and activations.',
          sessionType: SessionType.EVENT_COVERAGE,
          startingPrice: 'From CA$500',
        },
        {
          name: 'Architect & Designer Visualization',
          description: '3D + photo + video bundle for architects and interior designers.',
          startingPrice: 'From CA$349',
        },
        {
          name: 'Branded Flyers & Templates',
          description: 'Flyers, social templates, and print-ready collateral.',
          startingPrice: 'From CA$80',
        },
        {
          name: 'Monthly Social Media Kits',
          description: 'A month of ready-to-post photo + video + copy.',
          startingPrice: 'CA$400 / month',
        },
      ],
    },
    {
      key: ServiceCategory.ADD_ON_PREMIUM,
      title: 'Add-On & Premium',
      lede: 'Heavier engagements — full-scale coverage or ongoing creative direction.',
      services: [
        {
          name: 'Commercial & Event Coverage',
          description: 'Full-crew on-site coverage for commercial shoots and live events.',
          sessionType: SessionType.EVENT_COVERAGE,
          startingPrice: 'From CA$500',
        },
        {
          name: 'Content Subscription (Custom)',
          description: 'Higher-volume subscription plans scoped to your cadence.',
          startingPrice: 'Custom Quote',
        },
        {
          name: 'Creative Direction & Concept Design',
          description: 'Strategy and concept sessions with our lead creative.',
          startingPrice: 'CA$100 / session',
        },
      ],
    },
  ];
}
