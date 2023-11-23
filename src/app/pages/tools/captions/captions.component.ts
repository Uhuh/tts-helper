import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ColorChromeModule } from 'ngx-color/chrome';
import { ColorEvent } from 'ngx-color';
import { FormControl } from '@angular/forms';
import { TwitchService } from '../../../shared/services/twitch.service';
import { BorderString, captionsGenerator, PixelString, RGBAString } from './assets/captions';

@Component({
  selector: 'app-captions',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, InputComponent, ColorChromeModule],
  templateUrl: './captions.component.html',
  styleUrl: './captions.component.scss',
})
export class CaptionsComponent {
  fontSizeControl = new FormControl(16, { nonNullable: true });
  borderSizeControl = new FormControl(2, { nonNullable: true });
  borderRadiusControl = new FormControl(10, { nonNullable: true });
  paddingControl = new FormControl('10', { nonNullable: true });

  backgroundColor: RGBAString = 'rgba(100, 37, 175, 0.48)';
  fontColor: RGBAString = 'rgba(0, 0, 0, 1)';
  fontSize: PixelString = '16px';

  borderColor: RGBAString = 'rgba(255, 255, 255, 1)';
  borderRadius: PixelString = '10px';
  borderSize: PixelString = '2px';
  borderStyle: 'solid' | 'dotted' = 'solid';
  padding = '10px';

  username = 'Alphyx';

  constructor(private readonly twitchService: TwitchService) {
    this.twitchService.channelInfo$
      .subscribe(info => this.username = info.username ?? 'Alphyx');

    this.fontSizeControl.valueChanges
      .subscribe(size => this.fontSize = `${size}px`);

    this.borderSizeControl.valueChanges
      .subscribe(size => this.borderSize = `${size}px`);

    this.borderRadiusControl.valueChanges
      .subscribe(size => this.borderRadius = `${size}px`);

    this.paddingControl.valueChanges
      .subscribe(padding => this.parsePadding(padding));
  }

  parsePadding(padding: string) {
    this.padding = '';
    const paddings = padding.split(' ').filter(p => !isNaN(Number(p)) && p !== '');

    for (const p of paddings) {
      this.padding += ` ${p}px`;
    }
  }

  rgba(color: ColorEvent): RGBAString {
    const { r, b, g, a } = color.color.rgb;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  generate() {
    captionsGenerator({
      borderRadius: this.borderRadius,
      padding: this.padding,
      backgroundColor: this.backgroundColor,
      border: this.border,
      fontColor: this.fontColor,
      fontSize: this.fontSize,
    });
  }

  changeColor(event: ColorEvent, type: 'bg' | 'border' | 'font') {
    const color = this.rgba(event);

    switch (type) {
      case 'border':
        this.borderColor = color;
        break;
      case 'bg':
        this.backgroundColor = color;
        break;
      case 'font':
        this.fontColor = color;
        break;
    }
  }

  get border(): BorderString {
    return `${this.borderSize} ${this.borderStyle} ${this.borderColor}`;
  }
}
