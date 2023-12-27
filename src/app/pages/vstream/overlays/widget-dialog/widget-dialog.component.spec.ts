import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetDialogComponent } from './widget-dialog.component';

describe('WidgetDialogComponent', () => {
  let component: WidgetDialogComponent;
  let fixture: ComponentFixture<WidgetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
