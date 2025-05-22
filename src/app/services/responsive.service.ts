import { computed, effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private windoWidth = signal(window.innerWidth);
  isMobile = computed(() => this.windoWidth() < 1024);

  constructor() {
    effect(() => {
      const resizeObserver = new ResizeObserver(() => {
        this.windoWidth.set(window.innerWidth);
      });
      resizeObserver.observe(document.body);
      return () => resizeObserver.disconnect();
    })
  }
}
