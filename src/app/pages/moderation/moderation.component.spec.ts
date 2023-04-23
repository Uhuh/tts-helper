import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerationComponent } from './moderation.component';

describe('ModerationComponent', () => {
  let component: ModerationComponent;
  let fixture: ComponentFixture<ModerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModerationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
