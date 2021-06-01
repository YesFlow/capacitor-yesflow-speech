import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'wakeword',
    loadChildren: () => import('./wake-word-test/wake-word-test.module').then( m => m.WakeWordTestPageModule)
  },
  {
    path: 'visualizertest',
    loadChildren: () => import('./visualizer-test/visualizer-test.module').then( m => m.VisualizerTestPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
