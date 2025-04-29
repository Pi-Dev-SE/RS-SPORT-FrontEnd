import { NgModule } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChipsModule } from 'primeng/chips';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PasswordModule } from 'primeng/password';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [],
  exports: [
    DropdownModule,
    InputSwitchModule,
    MultiSelectModule,
    AutoCompleteModule,
    ChipsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule
  ]
})
export class PrimengModule { }
