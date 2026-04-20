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

export type RevealAnimation = 'fade-up' | 'fade' | 'scale' | 'fade-left' | 'fade-right';

@Directive({
  selector: '[smReveal]',
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input('smReveal') animation: RevealAnimation | '' = 'fade-up';
  @Input() smRevealDelay = 0;
  @Input() smRevealThreshold = 0.15;
  @Input() smRevealOnce = true;

  private observer?: IntersectionObserver;
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

    const host = this.el.nativeElement;
    const animation = this.animation || 'fade-up';
    this.renderer.addClass(host, 'sm-reveal');
    this.renderer.addClass(host, `sm-reveal--${animation}`);
    if (this.smRevealDelay) {
      this.renderer.setStyle(host, 'transition-delay', `${this.smRevealDelay}ms`);
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.renderer.addClass(host, 'is-revealed');
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.renderer.addClass(host, 'is-revealed');
              if (this.smRevealOnce) {
                this.observer?.unobserve(host);
              }
            } else if (!this.smRevealOnce) {
              this.renderer.removeClass(host, 'is-revealed');
            }
          }
        },
        { threshold: this.smRevealThreshold, rootMargin: '0px 0px -5% 0px' },
      );
      this.observer.observe(host);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
