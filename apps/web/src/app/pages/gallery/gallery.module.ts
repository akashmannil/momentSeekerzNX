import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { GalleryPageComponent } from './gallery-page.component';
import { PhotoDetailComponent } from './photo-detail/photo-detail.component';

@NgModule({
  declarations: [GalleryPageComponent, PhotoDetailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: GalleryPageComponent },
      { path: ':id', component: PhotoDetailComponent },
    ]),
  ],
})
export class GalleryPageModule {}
