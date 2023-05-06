import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/shared/services/config.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-windows',
  templateUrl: './windows.component.html',
  styleUrls: ['./windows.component.scss'],
})
export class WindowsComponent implements OnInit {
  windowsOptions = [];
  voiceControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {}
}
