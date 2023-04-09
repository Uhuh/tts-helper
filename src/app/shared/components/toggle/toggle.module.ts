import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from './toggle.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ToggleComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ToggleComponent],
})
export class ToggleModule {}
