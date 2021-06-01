import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WakeWordTestPage } from './wake-word-test.page';

const routes: Routes = [
  {
    path: '',
    component: WakeWordTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WakeWordTestPageRoutingModule {}
