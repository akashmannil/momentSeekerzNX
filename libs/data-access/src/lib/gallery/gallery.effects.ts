import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { GalleryActions } from './gallery.actions';
import { API_SERVICE_TOKEN } from '../../tokens';
import { PaginatedPhotos, Photo } from '@mss/shared';

@Injectable()
export class GalleryEffects {
  private actions$ = inject(Actions);
  private api = inject(API_SERVICE_TOKEN);

  loadPhotos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.loadPhotos),
      switchMap(({ page = 1, limit = 20, category, search }) => {
        const params: Record<string, string> = { page: String(page), limit: String(limit) };
        if (category) params['category'] = category;
        if (search) params['search'] = search;
        return this.api.get<PaginatedPhotos>('/gallery', params).pipe(
          map(result => GalleryActions.loadPhotosSuccess({ result })),
          catchError(err => of(GalleryActions.loadPhotosFailure({ error: err.message })))
        );
      })
    )
  );

  loadFeatured$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.loadFeatured),
      switchMap(({ limit = 6 }) =>
        this.api.get<Photo[]>('/gallery/featured', { limit: String(limit) }).pipe(
          map(photos => GalleryActions.loadFeaturedSuccess({ photos })),
          catchError(err => of(GalleryActions.loadFeaturedFailure({ error: err.message })))
        )
      )
    )
  );

  loadPhoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.loadPhoto),
      switchMap(({ id }) =>
        this.api.get<Photo>(`/gallery/${id}`).pipe(
          map(photo => GalleryActions.loadPhotoSuccess({ photo })),
          catchError(err => of(GalleryActions.loadPhotosFailure({ error: err.message })))
        )
      )
    )
  );

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.loadCategories),
      switchMap(() =>
        this.api.get<{ category: string; count: number }[]>('/gallery/categories').pipe(
          map(categories => GalleryActions.loadCategoriesSuccess({ categories })),
          catchError(() => of(GalleryActions.loadCategoriesSuccess({ categories: [] })))
        )
      )
    )
  );

  createPhoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.createPhoto),
      switchMap(({ data }) =>
        this.api.post<Photo>('/gallery', data).pipe(
          map(photo => GalleryActions.createPhotoSuccess({ photo })),
          catchError(err => of(GalleryActions.loadPhotosFailure({ error: err.message })))
        )
      )
    )
  );

  updatePhoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.updatePhoto),
      switchMap(({ id, data }) =>
        this.api.patch<Photo>(`/gallery/${id}`, data).pipe(
          map(photo => GalleryActions.updatePhotoSuccess({ photo })),
          catchError(err => of(GalleryActions.loadPhotosFailure({ error: err.message })))
        )
      )
    )
  );

  deletePhoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.deletePhoto),
      switchMap(({ id }) =>
        this.api.delete<void>(`/gallery/${id}`).pipe(
          map(() => GalleryActions.deletePhotoSuccess({ id })),
          catchError(err => of(GalleryActions.loadPhotosFailure({ error: err.message })))
        )
      )
    )
  );
}
