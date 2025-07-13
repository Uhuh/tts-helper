import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperchatComponent } from './superchat.component';

describe('SuperchatComponent', () => {
  let component: SuperchatComponent;
  let fixture: ComponentFixture<SuperchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperchatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
