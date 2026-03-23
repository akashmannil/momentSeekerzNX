import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GalleryActions, selectSelectedPhoto } from '@mss/data-access';
import { Photo } from '@mss/shared';

@Component({
  selector: 'mss-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrls: ['./photo-detail.component.scss'],
})
export class PhotoDetailComponent implements OnInit {
  photo$: Observable<Photo | null> = this.store.select(selectSelectedPhoto);

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.dispatch(GalleryActions.loadPhoto({ id }));
    this.store.dispatch(GalleryActions.setSelectedPhoto({ id }));
  }

  goBack(): void {
    this.router.navigate(['/gallery']);
  }
}
