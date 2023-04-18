import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BitsComponent } from './bits.component';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { InputModule } from 'src/app/shared/components/input/input.module';

@NgModule({
  declarations: [BitsComponent],
  imports: [CommonModule, InputModule],
  exports: [BitsComponent],
  providers: [TwitchService],
})
export class BitsModule {}
