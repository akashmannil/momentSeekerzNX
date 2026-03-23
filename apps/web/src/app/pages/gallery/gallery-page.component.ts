import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import {
  GalleryActions,
  selectFilteredPhotos,
  selectCategories,
  selectGalleryLoading,
  selectActiveCategory,
} from '@mss/data-access';
import { Photo, PhotoCategory } from '@mss/shared';

@Component({
  selector: 'mss-gallery-page',
  templateUrl: './gallery-page.component.html',
  styleUrls: ['./gallery-page.component.scss'],
})
export class GalleryPageComponent implements OnInit {
  photos$: Observable<Photo[]> = this.store.select(selectFilteredPhotos);
  categories$: Observable<{ category: string; count: number }[]> = this.store.select(selectCategories);
  loading$: Observable<boolean> = this.store.select(selectGalleryLoading);
  activeCategory$: Observable<PhotoCategory | null> = this.store.select(selectActiveCategory);

  readonly categoryLabels: Record<string, string> = {
    weddings: 'Weddings',
    portraits: 'Portraits',
    commercial: 'Commercial',
    landscape: 'Landscape',
    events: 'Events',
    'fine-art': 'Fine Art',
  };

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.store.dispatch(GalleryActions.loadPhotos({}));
    this.store.dispatch(GalleryActions.loadCategories());

    // Sync URL category query param with store
    this.route.queryParams.subscribe(params => {
      const cat = params['category'] as PhotoCategory | undefined;
      this.store.dispatch(GalleryActions.setActiveCategory({ category: cat ?? null }));
    });
  }

  setCategory(category: PhotoCategory | null): void {
    this.store.dispatch(GalleryActions.setActiveCategory({ category }));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category ?? null },
      queryParamsHandling: 'merge',
    });
  }

  openPhoto(photo: Photo): void {
    this.router.navigate(['/gallery', photo._id]);
  }

  trackByPhotoId(_index: number, photo: Photo): string {
    return photo._id;
  }
}
