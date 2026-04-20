import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiModule } from '@sm/ui';
import { HomeComponent } from './home.component';
import { GallerySceneComponent } from '../../three/gallery-scene.component';

@NgModule({
  declarations: [HomeComponent, GallerySceneComponent],
  imports: [
    CommonModule,
    UiModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }]),
  ],
})
export class HomeModule {}
