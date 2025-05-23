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
  private places: Place[] = [];
  private placemarks: any[] = [];

  constructor() {
    effect(() => {
      const isMobile = this.responsiveSvc.isMobile();
      console.log('isMobile changed:', isMobile);
      if (this.map && this.places.length > 0) {
        console.log('Updating markers due to isMobile change');
        this.updateMarkers(this.places);
      }
    });
  }

  initMap(containerId: string, places: Place[]) {
    this.places = places; // Сохраняем places
    this.placemarks = []; // Очищаем старые маркеры

    if (typeof ymaps === 'undefined') {
      setTimeout(() => this.initMap(containerId, places), 100);
      return;
    }

    ymaps.ready(() => {
      this.map = new ymaps.Map(containerId, {
        center: [55.7558, 37.6173],
        zoom: 10,
        controls: [],
      });

      // Создаем кастомный control для масштаба
      const customZoomControl = new ymaps.control.Button({
        data: {
          content: `
            <div class="custom-zoom-control">
              <button class="zoom-in">+</button>
              <button class="zoom-out">-</button>
            </div>
          `,
        },
        options: {
          selectOnClick: false, // Отключаем выделение кнопки при клике
          float: 'right', // Позиция справа
          position: { bottom: `${window.innerHeight / 4}px`, right: '16px' }, // Позиция на карте
        },
      });

      // Обработчики событий для кнопок
      customZoomControl.events.add('click', (e: any) => {
        const target = e.get('target');
        const zoom = this.map.getZoom();
        if (e.get('domEvent').get('target').classList.contains('zoom-in')) {
          this.map.setZoom(zoom + 1, { duration: 300 });
        } else if (e.get('domEvent').get('target').classList.contains('zoom-out')) {
          this.map.setZoom(zoom - 1, { duration: 300 });
        }
      });

      // Добавляем кастомный control на карту
      this.map.controls.add(customZoomControl);

      this.updateMarkers(places); // Инициализируем маркеры
    });
  }

  private updateMarkers(places: Place[]) {
    if (!this.map) return;

    if (this.placemarks.length === places.length) {
      // Обновляем только hintContent существующих маркеров
      this.placemarks.forEach((placemark, index) => {
        let hintContent = places[index].name;
        if (!this.responsiveSvc.isMobile()) {
          hintContent = `
          <strong>${places[index].name}</strong><br>
          Адрес: ${places[index].address}<br>
          Метро: ${places[index].metro.join(', ')}<br>
          Особенности: ${places[index].options.join(', ')}
        `;
        }
        placemark.properties.set('hintContent', hintContent);
      });
    } else {
      // Полное пересоздание маркеров, если их количество изменилось
      this.map.geoObjects.removeAll();
      this.placemarks = [];
      places.forEach((place) => {
        let hintContent = place.name;
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
          { hintContent },
          { preset: 'islands#redDotIcon' }
        );

        placemark.events.add('click', () => {
          this.map.setCenter([place.latitude, place.longitude], this.map.getZoom(), {
            duration: 300,
          });
        });

        this.map.geoObjects.add(placemark);
        this.placemarks.push(placemark);
      });
    }

    if (places.length > 0) {
      const bounds = this.map.geoObjects.getBounds();
      if (bounds) {
        this.map.setBounds(bounds, { checkZoomRange: true });
      }
    }
  }
}
