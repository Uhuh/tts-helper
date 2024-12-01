import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { ConfigService } from '../../shared/services/config.service';
import { MultiVoiceAccordionComponent } from './multi-voice-accordion/multi-voice-accordion.component';

@Component({
  selector: 'app-multi-voices',
  imports: [
    AsyncPipe,
    ButtonComponent,
    LabelBlockComponent,
    MultiVoiceAccordionComponent,
  ],
  templateUrl: './multi-voices.component.html',
  styleUrl: './multi-voices.component.scss',
})
export class MultiVoicesComponent {
  private readonly configService = inject(ConfigService);
  protected readonly multiVoices$ = this.configService.multiVoices$;

  createMultiVoice() {
    this.configService.createMultiVoice();
  }
}

export default MultiVoicesComponent;