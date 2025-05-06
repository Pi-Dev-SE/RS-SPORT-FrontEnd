import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

import { GameSheetListComponent } from './game-sheet-list/game-sheet-list.component';
import { GameSheetFormComponent } from './game-sheet-form/game-sheet-form.component';
import { GameSheetDetailComponent } from './game-sheet-detail/game-sheet-detail.component';

const routes: Routes = [
  { path: '', component: GameSheetListComponent },
  { path: 'add', component: GameSheetFormComponent },
  { path: 'add/:gameId', component: GameSheetFormComponent },
  { path: 'edit/:id', component: GameSheetFormComponent },
  { path: 'detail/:id', component: GameSheetDetailComponent }

]
@NgModule({
  declarations: [
    GameSheetListComponent,
    GameSheetFormComponent,
    GameSheetDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
        RouterModule.forChild(routes)
    
  ],
  exports: [
    GameSheetListComponent,
    GameSheetFormComponent,
    GameSheetDetailComponent
  ]
})
export class GameSheetModule { }