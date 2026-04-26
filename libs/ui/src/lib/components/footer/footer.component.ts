import { Component } from '@angular/core';

@Component({
  selector: 'sm-footer',
  template: `
    <footer class="border-t border-white/[0.06] py-16 px-6">
      <div class="max-w-7xl mx-auto">

        <!-- Main grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          <!-- Brand -->
          <div class="md:col-span-2">
            <p class="font-body text-sm font-bold tracking-tight text-white mb-4">Savage Media</p>
            <p class="font-body text-sm text-white/30 leading-relaxed max-w-xs">
              Full-service visual production — photography, video, aerial, 360° virtual tours,
              and 3D visualization. Built for brands that move fast.
            </p>
          </div>

          <!-- Navigate -->
          <div>
            <p class="section-label mb-6">Navigate</p>
            <ul class="space-y-3">
              <li><a routerLink="/services" class="font-body text-sm text-white/40 hover:text-white transition-colors duration-[200ms]">Services</a></li>
              <li><a routerLink="/pricing"  class="font-body text-sm text-white/40 hover:text-white transition-colors duration-[200ms]">Pricing</a></li>
              <li><a routerLink="/gallery"  class="font-body text-sm text-white/40 hover:text-white transition-colors duration-[200ms]">Gallery</a></li>
              <li><a routerLink="/about"    class="font-body text-sm text-white/40 hover:text-white transition-colors duration-[200ms]">About</a></li>
              <li><a routerLink="/booking"  class="font-body text-sm text-white/40 hover:text-white transition-colors duration-[200ms]">Book a Session</a></li>
            </ul>
          </div>

          <!-- Connect -->
          <div>
            <p class="section-label mb-6">Connect</p>
            <ul class="space-y-3">
              <li>
                <a href="mailto:hello&#64;savagemedia.online"
                   class="font-body text-sm text-white/40 hover:text-gold-400 transition-colors duration-[200ms]">
                  hello&#64;savagemedia.online
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-white/[0.06]">
          <p class="font-body text-[11px] text-white/20">© {{ year }} Savage Media. All rights reserved.</p>
          <a routerLink="/booking" class="btn-primary">Book a Session</a>
        </div>

      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
