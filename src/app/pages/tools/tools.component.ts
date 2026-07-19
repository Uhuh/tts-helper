import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptionsComponent } from './captions/captions.component';
import { OnScreenChatComponent } from './on-screen-chat/on-screen-chat.component';

@Component({
  selector: 'app-tools',
  imports: [CommonModule, CaptionsComponent, OnScreenChatComponent],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
})
export class ToolsComponent {

}

export default ToolsComponent;