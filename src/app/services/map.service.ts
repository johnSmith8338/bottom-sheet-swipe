import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  itemPlaceHeight = signal<number | null>(null);
  itemGap = signal<number | null>(null);
  itemCount = signal<number | null>(null);
  itemChildrenCount = signal<number | null>(null);
}
