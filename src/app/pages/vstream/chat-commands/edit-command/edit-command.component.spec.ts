import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCommandComponent } from './edit-command.component';

describe('EditCommandComponent', () => {
  let component: EditCommandComponent;
  let fixture: ComponentFixture<EditCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCommandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
