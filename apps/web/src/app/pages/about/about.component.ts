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
      title: 'Fine Art',
      image: IMAGES.fineArt,
      copy: 'Limited-edition museum prints crafted on archival paper with pigment inks.',
    },
  ];
}
