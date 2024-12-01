import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptionsComponent } from './captions/captions.component';

@Component({
    selector: 'app-tools',
    imports: [CommonModule, CaptionsComponent],
    templateUrl: './tools.component.html',
    styleUrl: './tools.component.scss'
})
export class ToolsComponent {

}

export default ToolsComponent;