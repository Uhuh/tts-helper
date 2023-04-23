import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './sidenav.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [SidenavComponent],
  imports: [CommonModule, MatIconModule, RouterModule],
  exports: [SidenavComponent],
})
export class SidenavModule {}
