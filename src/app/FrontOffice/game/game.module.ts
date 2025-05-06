import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

import { GameListComponent } from './game-list/game-list.component';
import { GameFormComponent } from './game-form/game-form.component';
import { GameDetailComponent } from './game-detail/game-detail.component';


const routes: Routes = [
  { path: '', component: GameListComponent },
  { path: 'add', component: GameFormComponent },
  { path: 'edit/:id', component: GameFormComponent },
  { path: 'detail/:id', component: GameDetailComponent }

]
@NgModule({
  declarations: [
    GameListComponent,
    GameFormComponent,
    GameDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgxPaginationModule,
            RouterModule.forChild(routes)
  ],
  exports: [
    GameListComponent,
    GameFormComponent,
    GameDetailComponent
  ]
})
export class GameModule { }