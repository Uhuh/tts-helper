import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-windows',
  templateUrl: './windows.component.html',
  styleUrls: ['./windows.component.scss'],
})
export class WindowsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  windowsOptions = [];
  voiceControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
