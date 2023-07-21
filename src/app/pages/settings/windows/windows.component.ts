import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/shared/services/config.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-windows',
  templateUrl: './windows.component.html',
  styleUrls: ['./windows.component.scss'],
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule],
})
export class WindowsComponent implements OnInit {
  windowsOptions = [];
  voiceControl = new FormControl('', { nonNullable: true });

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {}
}
