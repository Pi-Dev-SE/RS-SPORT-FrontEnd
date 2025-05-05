import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TimeAgoPipe } from './pipes/time-ago.pipe';



@NgModule({
  declarations: [
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    TimeAgoPipe
  ],
  providers: [
    DatePipe
  ]
})
export class CoreModule { }
