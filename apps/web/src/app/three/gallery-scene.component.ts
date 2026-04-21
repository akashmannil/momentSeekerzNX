import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, Input, OnChanges, SimpleChanges,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ThreeSceneService, SceneImage } from './three-scene.service';

@Component({
  selector: 'sm-gallery-scene',
  template: `
    <canvas
      #canvas
      class="three-canvas"
      style="pointer-events: none"
      aria-hidden="true"
      role="presentation"
    ></canvas>
  `,
  styles: [
    `
      :host { display: block; }
      canvas { display: block; }
    `,
  ],
})
export class GallerySceneComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() images: SceneImage[] = [];

  private destroy$ = new Subject<void>();
  private initialized = false;

  constructor(private threeScene: ThreeSceneService) {}

  ngAfterViewInit(): void {
    this.threeScene.initScene(this.canvasRef.nativeElement, this.images);
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] && !changes['images'].firstChange && this.initialized) {
      this.threeScene.updateImages(this.images);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.threeScene.dispose();
  }
}
