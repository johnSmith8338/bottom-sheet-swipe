import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Place } from '../../models/model';
import { MapService } from '../../services/map.service';
import { ResponsiveService } from '../../services/responsive.service';

@Component({
  selector: 'app-cinema',
  standalone: true,
  imports: [],
  templateUrl: './cinema.component.html',
  styleUrl: './cinema.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CinemaComponent {
  private dataSvc = inject(DataService);
  private mapSvc = inject(MapService);
  responsiveSvc = inject(ResponsiveService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  cinema = signal<Place | null>(null);
  isLoading = signal(true);
  isOpened = signal(false);

  @ViewChild('pullBlock') pullBlock!: ElementRef<HTMLDivElement>;
  @ViewChild('cinemaMap') cinemaMap!: ElementRef<HTMLDivElement>;
  @ViewChild('cinemaDetails') cinemaDetails!: ElementRef<HTMLDivElement>;

  private touchStartY: number | null = null;
  private mapHeight: number = 390;
  private maxOffset: number = -100;
  private isDragging = false;

  constructor() {
    effect(() => {
      const places = this.dataSvc.places();
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (places.length > 0) {
        this.isLoading.set(false);
        if (id) {
          const foundCinema = places.find(place => place.id === id) || null;
          this.cinema.set(foundCinema);
          if (foundCinema) {
            this.mapSvc.initMap('cinema-map', [foundCinema], 16);
            setTimeout(() => {
              if (this.cinemaMap && this.cinemaDetails) {
                this.mapHeight = this.cinemaMap.nativeElement.offsetHeight;
                this.maxOffset = -this.mapHeight / 4;
                // Устанавливаем начальное смещение
                this.cinemaMap.nativeElement.style.transform = !this.responsiveSvc.isMobile() ? `translateY(0)` : `translateY(${this.maxOffset}px)`;
                this.cinemaDetails.nativeElement.style.transform = !this.responsiveSvc.isMobile() ? `translateY(0)` : `translateY(${this.maxOffset * 2}px)`;
                this.isOpened.set(false);
              }
            }, 0);
          }
        } else {
          this.cinema.set(null);
        }
      } else {
        this.isLoading.set(true);
      }
    }, { allowSignalWrites: true });
  }

  handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.touchStartY = event.touches[0].clientY;
    this.isDragging = true;
    if (this.cinemaMap && this.cinemaDetails) {
      this.cinemaMap.nativeElement.style.transition = 'transform 0.3s ease';
      this.cinemaDetails.nativeElement.style.transition = 'transform 0.3s ease';
    }
  }

  handleTouchMove(event: TouchEvent): void {
    if (!this.touchStartY || !this.isDragging || !this.cinemaMap || !this.cinemaDetails) return;

    event.preventDefault();
    const touchCurrentY = event.touches[0].clientY;
    const deltaY = touchCurrentY - this.touchStartY;
    // Ограничиваем смещение карты: от maxOffset до 0
    const mapOffset = Math.max(this.maxOffset, Math.min(0, deltaY));
    // Смещение для деталей в 2 раза больше
    const detailsOffset = mapOffset * 2;
    this.cinemaMap.nativeElement.style.transform = `translateY(${mapOffset}px)`;
    this.cinemaDetails.nativeElement.style.transform = `translateY(${detailsOffset}px)`;
  }

  handleTouchEnd(): void {
    if (!this.isDragging || !this.cinemaMap || !this.cinemaDetails) return;

    this.isDragging = false;
    this.touchStartY = null;
    this.cinemaMap.nativeElement.style.transition = 'transform 0.3s ease';
    this.cinemaDetails.nativeElement.style.transition = 'transform 0.3s ease';

    // Определяем текущее смещение карты
    const currentMapOffset = parseFloat(this.cinemaMap.nativeElement.style.transform.match(/-?\d+\.?\d*/)?.[0] || '0');
    // Если смещение ближе к 0 (более половины пути), фиксируем на 0, иначе возвращаем к maxOffset
    const targetMapOffset = currentMapOffset > this.maxOffset / 2 ? 0 : this.maxOffset;
    const targetDetailsOffset = targetMapOffset * 2;

    this.cinemaMap.nativeElement.style.transform = `translateY(${targetMapOffset}px)`;
    this.cinemaDetails.nativeElement.style.transform = `translateY(${targetDetailsOffset}px)`;
    this.isOpened.set(targetMapOffset === 0);
  }

  // Метод для возврата назад
  goBack(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
