import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, ElementRef, HostBinding, inject, ViewChild } from '@angular/core';
import { ListComponent } from './elements/list/list.component';
import { MapService } from '../../services/map.service';
import { Place } from '../../models/model';
import { SearchComponent } from '../search/search.component';
import { SearchService } from '../../services/search.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [
    ListComponent,
    SearchComponent,
  ],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  private mapSvc = inject(MapService);
  private searchSvc = inject(SearchService);
  dataSvc = inject(DataService);
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);

  filteredPlaces: Place[] = [];
  private isDragging = false;
  private startY = 0;
  private initialHeight = 0;
  private currentHeight = this.initialHeight;
  private minHeight = 0;
  private swipeThreshold = 2;

  maxHeight = computed(() => {
    const itemHeight = this.mapSvc.itemPlaceHeight();
    const itemGap = this.mapSvc.itemGap();
    const itemCount = this.mapSvc.itemCount();

    if (itemHeight !== null && itemGap !== null && itemCount !== null && itemCount > 0) {
      const itemFullHeight = itemHeight + itemGap * 2;
      const totalHeight = itemFullHeight * itemCount;
      const calculatedMaxHeight = Math.min(totalHeight, 90);
      return calculatedMaxHeight;
    }
    return 90;
  });

  // @HostBinding('style.height') hostHeight = this.initialHeight + 'vh';
  @ViewChild('content') content!: ElementRef;

  constructor() {
    this.setHeight(this.currentHeight);

    effect(() => {
      const places = this.dataSvc.places();
      this.searchSvc.setPlaces(places);
      this.filteredPlaces = places;
    }, { allowSignalWrites: true });

    effect(() => {
      const filtered = this.searchSvc.filteredPlaces();
      this.filteredPlaces = filtered;
      this.cdr.detectChanges();
    }, { allowSignalWrites: true });

    effect(() => {
      const newMaxHeight = this.maxHeight();
      if (this.currentHeight > newMaxHeight) {
        this.currentHeight = newMaxHeight;
        this.initialHeight = this.currentHeight;
        this.setHeight(this.currentHeight);
        this.cdr.detectChanges();
      }
    });
  }

  private setHeight(height: number): void {
    this.elementRef.nativeElement.style.height = `${height}vh`;
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.startY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    const contentElement = this.content.nativeElement;
    const currentY = event.touches[0].clientY;
    const deltaY = this.startY - currentY;

    if (contentElement && contentElement.scrollTop > 0 && deltaY < 0) {
      return;
    }

    const adjustedDeltaY = deltaY * this.swipeThreshold;
    const deltaHeight = (adjustedDeltaY / window.innerHeight) * 100;
    this.currentHeight = Math.min(
      Math.max(this.initialHeight + deltaHeight, this.minHeight),
      this.maxHeight()
    );

    this.setHeight(this.currentHeight);
  }

  onTouchEnd() {
    this.isDragging = false;

    const itemHeight = this.mapSvc.itemPlaceHeight();
    const itemGap = this.mapSvc.itemGap();
    const levels = [0];

    if (itemGap === null || itemHeight === null) return;
    const itemFullHeight = itemHeight + itemGap * 2;


    if (itemHeight !== null && itemHeight > 0) {
      let level = itemFullHeight;
      while (level <= this.maxHeight()) {
        levels.push(level);
        level += itemFullHeight;
      }
      if (levels[levels.length - 1] < this.maxHeight()) {
        levels.push(this.maxHeight());
      }
    } else {
      levels.push(this.maxHeight());
    }

    let targetHeight = 0;
    for (let i = 0; i < levels.length; i++) {
      if (this.currentHeight < levels[i]) {
        const threshold = levels[i - 1] + (itemHeight && itemHeight > 0 ? itemHeight / 2 : this.maxHeight() / 2);
        targetHeight = this.currentHeight >= threshold ? levels[i] : levels[i - 1];
        break;
      }
    }
    if (this.currentHeight >= levels[levels.length - 1]) {
      targetHeight = this.maxHeight();
    }

    this.currentHeight = targetHeight;
    this.setHeight(this.currentHeight);
    this.initialHeight = this.currentHeight;
  }
}
