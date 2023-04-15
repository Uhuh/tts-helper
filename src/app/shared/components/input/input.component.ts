import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  @Input() placeholder = 'Put something here...';
  @Input() control!: FormControl<string | null>;
  @Input() type = 'text';
  ngOnInit(): void {}
}
