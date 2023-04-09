import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { InputModule } from '../../shared/components/input/input.module';
import { ButtonModule } from '../../shared/components/button/button.module';
import { SelectModule } from '../../shared/components/select/select.module';
import { ToggleModule } from '../../shared/components/toggle/toggle.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HistoryModule } from 'src/app/shared/components/history/history.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    InputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    HistoryModule,
    ButtonModule,
    SelectModule,
    ToggleModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
    RouterModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
