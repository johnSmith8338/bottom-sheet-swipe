import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { CinemaComponent } from './components/cinema/cinema.component';

export const routes: Routes = [
    {
        path: '', component: MapComponent
    },
    {
        path: 'cinema/:id', component: CinemaComponent
    }
];
