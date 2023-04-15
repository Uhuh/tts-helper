import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HistoryService } from '../../services/history.service';
import { AuditItem } from '../../state/history/history-item.interface';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  items: AuditItem[] = [];

  constructor(
    private readonly historyService: HistoryService,
    private readonly ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.historyService.auditItems$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((items) => {
        this.items = items;
        this.ref.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
