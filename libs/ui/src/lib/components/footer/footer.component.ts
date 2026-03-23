import { Component } from '@angular/core';

@Component({
  selector: 'mss-footer',
  template: `
    <footer class="bg-obsidian-950 border-t border-white/5 py-16 px-6">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p class="font-display text-2xl mb-4">Moment Seekers Studio</p>
          <p class="font-body text-white/40 text-sm leading-relaxed max-w-xs">
            Cinematic photography & fine-art prints. Based in New York, available worldwide.
          </p>
        </div>
        <div>
          <p class="section-label mb-6">Navigate</p>
          <ul class="space-y-3">
            <li><a routerLink="/gallery" class="font-body text-sm text-white/50 hover:text-gold-400 transition-colors">Gallery</a></li>
            <li><a routerLink="/store" class="font-body text-sm text-white/50 hover:text-gold-400 transition-colors">Store</a></li>
            <li><a routerLink="/about" class="font-body text-sm text-white/50 hover:text-gold-400 transition-colors">About</a></li>
            <li><a routerLink="/booking" class="font-body text-sm text-white/50 hover:text-gold-400 transition-colors">Book a Session</a></li>
          </ul>
        </div>
        <div>
          <p class="section-label mb-6">Connect</p>
          <ul class="space-y-3">
            <li><a href="mailto:hello@momentseekerstudio.com" class="font-body text-sm text-white/50 hover:text-gold-400 transition-colors">hello@momentseekerstudio.com</a></li>
          </ul>
        </div>
      </div>
      <div class="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <p class="font-body text-white/20 text-xs">© {{ year }} Moment Seekers Studio. All rights reserved.</p>
        <p class="font-body text-white/20 text-xs">Crafted with intention.</p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
