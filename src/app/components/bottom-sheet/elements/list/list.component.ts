import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, inject, Input, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { MapService } from '../../../../services/map.service';
import { Place } from '../../../../models/model';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements AfterViewInit {
  mapSvc = inject(MapService);
  private cdr = inject(ChangeDetectorRef);
  @Input() places: Place[] = [];
  @ViewChild('item') firstItem!: ElementRef;
  @ViewChildren('item') items!: QueryList<ElementRef>;

  private placesSignal = signal<Place[]>([]);

  constructor() {
    effect(() => {
      const currentPlaces = this.placesSignal();
      this.cdr.detectChanges();
      setTimeout(() => this.updateMeasurements(), 0);

      // Прокрутка к активному элементу
      const activePlaceId = this.mapSvc.activePlaceId();
      if (activePlaceId !== null) {
        const activeIndex = this.places.findIndex((place) => place.id === activePlaceId);
        if (activeIndex >= 0 && this.items) {
          const activeElement = this.items.toArray()[activeIndex]?.nativeElement;
          if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateMeasurements();
  }

  ngOnChanges(): void {
    this.placesSignal.set(this.places);
  }

  private updateMeasurements(): void {
    const itemCount = this.items.length;
    this.mapSvc.itemCount.set(itemCount);

    if (this.firstItem && itemCount > 0) {
      // Количество дочерних элементов в первом .item
      const childrenCount = this.firstItem.nativeElement.children.length;
      this.mapSvc.itemChildrenCount.set(childrenCount);

      // Высота первого .item в vh
      const itemHeightPx = this.firstItem.nativeElement.offsetHeight;
      const itemHeightVh = Math.round((itemHeightPx / window.innerHeight) * 100);
      this.mapSvc.itemPlaceHeight.set(itemHeightVh);

      // Значение --item-gap в vh
      const hostElement = this.firstItem.nativeElement.closest('app-list');
      if (hostElement) {
        const styles = getComputedStyle(hostElement);
        const itemGapPx = parseFloat(styles.getPropertyValue('--item-gap')) || 16;
        const itemGapVh = Math.round((itemGapPx / window.innerHeight) * 100);
        this.mapSvc.itemGap.set(itemGapVh);
      } else {
        console.error('Host element (app-list) not found');
        this.mapSvc.itemGap.set(null);
      }
    } else {
      console.warn('No items found, skipping measurements');
      this.mapSvc.itemPlaceHeight.set(null);
      this.mapSvc.itemGap.set(null);
      this.mapSvc.itemChildrenCount.set(null);
    }
  }
}
