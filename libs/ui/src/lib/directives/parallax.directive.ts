import {
  AfterViewInit,
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[smParallax]',
})
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  @Input('smParallax') speed: number | string = 0.3;
  @Input() smParallaxAxis: 'y' | 'x' = 'y';

  private rafId = 0;
  private ticking = false;
  private onScroll = (): void => this.request();
  private onResize = (): void => this.request();
  private readonly isBrowser: boolean;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      this.update();
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private request(): void {
    if (this.ticking) return;
    this.ticking = true;
    this.rafId = requestAnimationFrame(() => this.update());
  }

  private update(): void {
    this.ticking = false;
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;

    if (rect.bottom < -200 || rect.top > viewportH + 200) return;

    const speed = typeof this.speed === 'string' ? parseFloat(this.speed) || 0.3 : this.speed;
    const centerOffset = rect.top + rect.height / 2 - viewportH / 2;
    const shift = -centerOffset * speed;

    const transform =
      this.smParallaxAxis === 'x'
        ? `translate3d(${shift.toFixed(2)}px, 0, 0)`
        : `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    this.renderer.setStyle(host, 'transform', transform);
  }
}
