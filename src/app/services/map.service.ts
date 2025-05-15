import { effect, inject, Injectable, signal } from '@angular/core';
import { Place } from '../models/model';
import { ResponsiveService } from './responsive.service';

declare const ymaps: any; // Объявляем ymaps как глобальную переменную

@Injectable({
  providedIn: 'root'
})
export class MapService {
  itemPlaceHeight = signal<number | null>(null);
  itemGap = signal<number | null>(null);
  itemCount = signal<number | null>(null);
  itemChildrenCount = signal<number | null>(null);

  private responsiveSvc = inject(ResponsiveService);

  private map: any;

  initMap(containerId: string, places: Place[]) {
    // Проверяем, что API Яндекс Карт загружен
    if (typeof ymaps === 'undefined') return;

    // Инициализируем карту после загрузки API
    ymaps.ready(() => {
      this.map = new ymaps.Map(containerId, {
        center: [55.7558, 37.6173], // Центр Москвы
        zoom: 10,
        controls: ['zoomControl'], // Добавляем элементы управления
      });

      // Добавляем маркеры для каждого кинотеатра
      places.forEach((place) => {
        let hintContent = place.name;

        // Для десктопа добавляем полную информацию в hintContent
        if (!this.responsiveSvc.isMobile()) {
          hintContent = `
            <strong>${place.name}</strong><br>
            Адрес: ${place.address}<br>
            Метро: ${place.metro.join(', ')}<br>
            Особенности: ${place.options.join(', ')}
          `;
        }

        const placemark = new ymaps.Placemark(
          [place.latitude, place.longitude],
          {
            hintContent: hintContent,
          },
          {
            preset: 'islands#redDotIcon', // Стиль маркера
          }
        );

        // Добавляем обработчик клика на маркер
        placemark.events.add('click', () => {
          this.map.setCenter([place.latitude, place.longitude], this.map.getZoom(), {
            duration: 300,
          });
        });

        this.map.geoObjects.add(placemark);
      });

      // Если есть места, центрируем карту по маркерам
      if (places.length > 0) {
        const bounds = this.map.geoObjects.getBounds();
        if (bounds) {
          this.map.setBounds(bounds, { checkZoomRange: true });
        }
      }
    });
  }
}
