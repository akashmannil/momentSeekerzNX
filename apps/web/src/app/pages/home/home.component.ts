import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GalleryActions, selectFeaturedPhotos, selectGalleryLoadingFeatured } from '@sm/data-access';
import { Photo } from '@sm/shared';
import { SceneImage } from '../../three/three-scene.service';

@Component({
  selector: 'sm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  featured$: Observable<Photo[]> = this.store.select(selectFeaturedPhotos);
  loading$: Observable<boolean> = this.store.select(selectGalleryLoadingFeatured);
  sceneImages: SceneImage[] = [];

  private destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(GalleryActions.loadFeatured({ limit: 12 }));

    // Map Photo[] → SceneImage[] for the 3D component
    this.featured$.pipe(takeUntil(this.destroy$)).subscribe(photos => {
      this.sceneImages = photos.map(p => ({
        id: p._id,
        url: p.thumbnailUrl ?? p.imageUrl,
        title: p.title,
      }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
