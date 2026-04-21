import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GalleryActions, selectFeaturedPhotos, selectGalleryLoadingFeatured } from '@sm/data-access';
import { Photo } from '@sm/shared';
import { SceneImage } from '../../three/three-scene.service';
import { DEFAULT_SCENE_IMAGES, IMAGES } from '../../shared/image-assets';

@Component({
  selector: 'sm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  featured$: Observable<Photo[]> = this.store.select(selectFeaturedPhotos);
  loading$: Observable<boolean> = this.store.select(selectGalleryLoadingFeatured);
  sceneImages: SceneImage[] = DEFAULT_SCENE_IMAGES;

  readonly images = IMAGES;

  private destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(GalleryActions.loadFeatured({ limit: 12 }));

    this.featured$.pipe(takeUntil(this.destroy$)).subscribe(photos => {
      const mapped: SceneImage[] = photos.map(p => ({
        id: p._id,
        url: p.thumbnailUrl ?? p.imageUrl,
        title: p.title,
      }));
      // Fill any remaining plane slots with curated fallbacks so every
      // WebGL tile always has imagery — no empty planes.
      this.sceneImages = [
        ...mapped,
        ...DEFAULT_SCENE_IMAGES.slice(mapped.length),
      ];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
