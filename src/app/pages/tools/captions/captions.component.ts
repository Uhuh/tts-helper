import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ColorChromeModule } from 'ngx-color/chrome';
import { ColorEvent } from 'ngx-color';
import { FormControl } from '@angular/forms';
import { TwitchService } from '../../../shared/services/twitch.service';
import { BorderString, captionsGenerator, PixelString, RGBAString } from './assets/captions';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-captions',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, InputComponent, ColorChromeModule, ButtonComponent],
  templateUrl: './captions.component.html',
  styleUrl: './captions.component.scss',
})
export class CaptionsComponent {
  private readonly twitchService = inject(TwitchService);
  private readonly snackbar = inject(MatSnackBar);

  readonly maxWidthControl = new FormControl(300, { nonNullable: true });
  readonly fontSizeControl = new FormControl(16, { nonNullable: true });
  readonly borderSizeControl = new FormControl(2, { nonNullable: true });
  readonly borderRadiusControl = new FormControl(6, { nonNullable: true });
  readonly paddingControl = new FormControl('10', { nonNullable: true });

  backgroundColor: RGBAString = 'rgba(100, 37, 175, 0.48)';
  fontColor: RGBAString = 'rgba(255, 255, 255, 1)';
  fontSize: PixelString = '16px';
  maxWidth: PixelString = '300px';

  borderColor: RGBAString = 'rgba(255, 255, 255, 1)';
  borderRadius: PixelString = '6px';
  borderSize: PixelString = '2px';
  borderStyle: 'solid' | 'dotted' = 'solid';
  padding = '10px';

  username = 'Alphyx';

  constructor() {
    this.twitchService.channelInfo$
      .pipe(takeUntilDestroyed())
      .subscribe(info => this.username = info.username ?? 'Alphyx');

    this.fontSizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(size => this.fontSize = `${size}px`);

    this.borderSizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(size => this.borderSize = `${size}px`);

    this.borderRadiusControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(size => this.borderRadius = `${size}px`);

    this.paddingControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(padding => this.parsePadding(padding));

    this.maxWidthControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(width => this.maxWidth = `${width}px`);
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
    return captionsGenerator({
      borderRadius: this.borderRadius,
      padding: this.padding,
      backgroundColor: this.backgroundColor,
      border: this.border,
      fontColor: this.fontColor,
      fontSize: this.fontSize,
      maxWidth: this.maxWidth,
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

  downloadCaptions() {
    const data = 'data:text/html;charset=utf-8,' + encodeURIComponent(this.generate());

    const anchor = document.createElement('a');
    anchor.download = `tts-helper-captions.html`;
    anchor.href = data;
    anchor.click();

    this.snackbar.open('Successfully downloaded captions file.', 'Dismiss', {
      panelClass: 'notification-success',
    });
  }
}
