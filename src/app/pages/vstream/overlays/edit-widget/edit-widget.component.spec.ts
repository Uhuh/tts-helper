import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWidgetComponent } from './edit-widget.component';

describe('WidgetDialogComponent', () => {
  let component: EditWidgetComponent;
  let fixture: ComponentFixture<EditWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
