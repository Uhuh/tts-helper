import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ColorChromeModule } from 'ngx-color/chrome';
import { ColorEvent } from 'ngx-color';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlaybackService } from '../../../shared/services/playback.service';
import { Store } from '@ngrx/store';
import { AudioFeature, AudioItem, AudioSource } from '../../../shared/state/audio/audio.feature';
import { MatSnackBar } from '@angular/material/snack-bar';
import { onScreenChatGenerator, RGBAString } from './assets/on-screen-chat-generator';

interface ChatMessage extends AudioItem {
  isCurrentlyPlaying: boolean;
}

@Component({
  selector: 'app-on-screen-chat',
  imports: [
    CommonModule,
    LabelBlockComponent,
    InputComponent,
    ColorChromeModule,
    ButtonComponent,
    ToggleComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './on-screen-chat.component.html',
  styleUrl: './on-screen-chat.component.scss',
})
export class OnScreenChatComponent {
  private readonly playbackService = inject(PlaybackService);
  private readonly store = inject(Store);
  private readonly snackbar = inject(MatSnackBar);

  readonly fontSizeControl = new FormControl(16, { nonNullable: true });
  readonly maxMessagesControl = new FormControl(50, { nonNullable: true });

  backgroundColor: RGBAString = 'rgba(18, 18, 18, 1)';
  messageColor: RGBAString = 'rgba(255, 255, 255, 1)';
  highlightColor: RGBAString = 'rgba(100, 37, 175, 0.8)';

  fontSize = 16;
  maxMessages = 50;

  showSourceBadge = new FormControl(true, { nonNullable: true });

  filterTwitch = new FormControl(true, { nonNullable: true });
  filterYoutube = new FormControl(true, { nonNullable: true });
  filterTtsHelper = new FormControl(true, { nonNullable: true });
  filterGpt = new FormControl(true, { nonNullable: true });
  filterAzure = new FormControl(true, { nonNullable: true });
  filterVstream = new FormControl(true, { nonNullable: true });

  messages: ChatMessage[] = [];
  currentlyPlayingId: number | null = null;

  constructor() {
    this.fontSizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(size => this.fontSize = size);

    this.maxMessagesControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(max => this.maxMessages = max);

    this.store.select(AudioFeature.selectAudioItems)
      .pipe(takeUntilDestroyed())
      .subscribe(queue => {
        this.messages = queue
          .filter(item => this.shouldShowSource(item.source))
          .map(item => ({
            ...item,
            isCurrentlyPlaying: item.id === this.currentlyPlayingId,
          }))
          .slice(0, this.maxMessages);
      });

    this.playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(id => {
        this.currentlyPlayingId = id;
        this.updateCurrentlyPlaying();
      });

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentlyPlayingId = null;
        this.updateCurrentlyPlaying();
      });
  }

  shouldShowSource(source: AudioSource): boolean {
    switch (source) {
      case 'twitch':
        return this.filterTwitch.value;
      case 'youtube':
        return this.filterYoutube.value;
      case 'tts-helper':
        return this.filterTtsHelper.value;
      case 'gpt':
        return this.filterGpt.value;
      case 'azure':
        return this.filterAzure.value;
      case 'vstream':
        return this.filterVstream.value;
      default:
        return true;
    }
  }

  updateCurrentlyPlaying() {
    this.messages = this.messages.map(msg => ({
      ...msg,
      isCurrentlyPlaying: msg.id === this.currentlyPlayingId,
    }));
  }

  rgba(color: ColorEvent): RGBAString {
    const { r, b, g, a } = color.color.rgb;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  changeColor(event: ColorEvent, type: 'bg' | 'message' | 'highlight') {
    const color = this.rgba(event);

    switch (type) {
      case 'bg':
        this.backgroundColor = color;
        break;
      case 'message':
        this.messageColor = color;
        break;
      case 'highlight':
        this.highlightColor = color;
        break;
    }
  }

  getSourceLabel(source: AudioSource): string {
    const labels: Record<AudioSource, string> = {
      'twitch': 'Twitch',
      'youtube': 'YouTube',
      'tts-helper': 'TTS Helper',
      'gpt': 'GPT',
      'azure': 'Azure',
      'vstream': 'VStream',
    };
    return labels[source];
  }

  generate() {
    return onScreenChatGenerator({
      fontSize: this.fontSize,
      maxMessages: this.maxMessages,
      backgroundColor: this.backgroundColor,
      messageColor: this.messageColor,
      highlightColor: this.highlightColor,
      showSourceBadge: this.showSourceBadge.value,
      filterTwitch: this.filterTwitch.value,
      filterYoutube: this.filterYoutube.value,
      filterTtsHelper: this.filterTtsHelper.value,
      filterGpt: this.filterGpt.value,
      filterAzure: this.filterAzure.value,
      filterVstream: this.filterVstream.value,
    });
  }

  getUsernameColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash) % 20);
    const lightness = 55 + (Math.abs(hash) % 15);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  downloadOnScreenChat() {
    const data = 'data:text/html;charset=utf-8,' + encodeURIComponent(this.generate());

    const anchor = document.createElement('a');
    anchor.download = `tts-helper-on-screen-chat.html`;
    anchor.href = data;
    anchor.click();

    this.snackbar.open('Successfully downloaded on-screen chat file.', 'Dismiss', {
      panelClass: 'notification-success',
    });
  }
}
