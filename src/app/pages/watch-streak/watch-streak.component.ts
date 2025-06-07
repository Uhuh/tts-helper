import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { InputComponent } from '../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { ChatService } from '../../shared/services/chat.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UserStreakInfo } from '../../shared/state/watch-streak/watch-streak.feature';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-watch-streak',
  imports: [
    InputComponent,
    LabelBlockComponent,
    AsyncPipe,
    MatTableModule,
    MatPaginator,
    MatSort,
    MatSortHeader,
  ],
  templateUrl: './watch-streak.component.html',
  styleUrl: './watch-streak.component.scss',
})
export class WatchStreakComponent implements AfterViewInit {
  private readonly chatService = inject(ChatService);
  readonly userStreaks$ = this.chatService.watchStreakState$.pipe(
    map(state => state.userStreaks),
  );
  readonly watchStreakState$ = this.chatService.watchStreakState$;

  readonly displayColumns = ['userName', 'currentStreak', 'highestStreak'];
  dataSource: MatTableDataSource<UserStreakInfo>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly settings = new FormGroup({
    gracePeriodDays: new FormControl(0, { nonNullable: true }),
  });

  constructor() {
    this.watchStreakState$
      .pipe(takeUntilDestroyed())
      .subscribe(({ gracePeriodDays }) => {
        this.settings.setValue({ gracePeriodDays }, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(partial => this.chatService.updateWatchStreak(partial));

    this.dataSource = new MatTableDataSource<UserStreakInfo>([]);

    this.userStreaks$
      .pipe(takeUntilDestroyed())
      .subscribe((userStreaks) => this.dataSource.data = userStreaks);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}

export default WatchStreakComponent;