import { Routes } from '@angular/router';
import { SnakeComponent } from './animals/snake/snake.component';
import { FishComponent } from './animals/fish/fish.component';
import { LizardComponent } from './animals/lizard/lizard.component';

export const routes: Routes = [
    { path: 'snake', component: SnakeComponent },
    { path: 'fish', component: FishComponent  },
    { path: 'lizard',component: LizardComponent },

    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' },
];
