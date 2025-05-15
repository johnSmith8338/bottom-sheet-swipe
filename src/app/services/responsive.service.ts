import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private windoWidth = signal(window.innerWidth);
  isMobile = signal(this.windoWidth() < 1024);

  constructor() {
    effect(() => {
      const resizeObserver = new ResizeObserver(() => {
        this.windoWidth.set(window.innerWidth);
        this.isMobile.set(this.windoWidth() < 1024);
      });
      resizeObserver.observe(document.body);
      return () => resizeObserver.disconnect();
    })
  }

}
