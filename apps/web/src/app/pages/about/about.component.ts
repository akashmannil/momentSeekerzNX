import { Component } from '@angular/core';
import { IMAGES } from '../../shared/image-assets';

@Component({
  selector: 'sm-about',
  templateUrl: './about.component.html',
})
export class AboutComponent {
  readonly images = IMAGES;

  readonly disciplines = [
    {
      title: 'Weddings',
      image: IMAGES.wedding,
      copy: 'Full-day documentary coverage that tells your story with honesty and artistry.',
    },
    {
      title: 'Portraits',
      image: IMAGES.portrait,
      copy: 'Intimate sessions designed to reveal the authentic you rather than a performed version.',
    },
    {
      title: 'Creative Direction',
      image: IMAGES.creativeDirection,
      copy: 'Strategy and concept design sessions with our lead creative for launches and long-form campaigns.',
    },
  ];
}
