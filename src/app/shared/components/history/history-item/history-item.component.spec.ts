import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryItemComponent } from './history-item.component';

describe('HistoryItemComponent', () => {
  let component: HistoryItemComponent;
  let fixture: ComponentFixture<HistoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
