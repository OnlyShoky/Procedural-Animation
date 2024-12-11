import { Routes } from '@angular/router';
import { SnakeComponent } from './animals/snake/snake.component';
import { FishComponent } from './animals/fish/fish.component';
import { LizardComponent } from './animals/lizard/lizard.component';
import { YinyangComponent } from './animation/yinyang/yinyang.component';

export const routes: Routes = [
    { path: 'snake', component: SnakeComponent },
    { path: 'fish', component: FishComponent  },
    { path: 'lizard',component: LizardComponent },
    { path: 'yinyang',component: YinyangComponent },


    { path: '', redirectTo: 'snake', pathMatch: 'full' },
    { path: '**', redirectTo: 'yinyang' },
];
