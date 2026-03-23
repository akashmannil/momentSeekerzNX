import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  GalleryActions,
  selectAllPhotos,
  selectGalleryLoading,
} from '@mss/data-access';
import { Photo } from '@mss/shared';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'mss-gallery-manager',
  templateUrl: './gallery-manager.component.html',
})
export class GalleryManagerComponent implements OnInit {
  photos$: Observable<Photo[]> = this.store.select(selectAllPhotos);
  loading$: Observable<boolean> = this.store.select(selectGalleryLoading);
  uploading = false;
  uploadError: string | null = null;

  constructor(private readonly store: Store, private readonly api: ApiService) {}

  ngOnInit(): void {
    this.store.dispatch(GalleryActions.loadPhotos({ published: false } as any));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;
    this.uploadError = null;

    const formData = new FormData();
    formData.append('file', file);

    this.api.post<any>('/upload/photo', formData).subscribe({
      next: result => {
        this.uploading = false;
        // Auto-create a photo record with the uploaded URLs
        this.store.dispatch(
          GalleryActions.createPhoto({
            data: {
              title: file.name.replace(/\.[^.]+$/, ''),
              imageUrl: result.originalUrl,
              thumbnailUrl: result.thumbnailUrl,
              webpUrl: result.webpUrl,
              category: 'portraits' as any,
              published: false,
            },
          })
        );
      },
      error: err => {
        this.uploading = false;
        this.uploadError = err.message;
      },
    });
  }

  togglePublish(photo: Photo): void {
    this.store.dispatch(
      GalleryActions.updatePhoto({ id: photo._id, data: { published: !photo.published } })
    );
  }

  toggleFeatured(photo: Photo): void {
    this.store.dispatch(
      GalleryActions.updatePhoto({ id: photo._id, data: { featured: !photo.featured } })
    );
  }

  deletePhoto(photo: Photo): void {
    if (!confirm(`Delete "${photo.title}"?`)) return;
    this.store.dispatch(GalleryActions.deletePhoto({ id: photo._id }));
  }
}
