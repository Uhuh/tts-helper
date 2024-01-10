import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundCommandComponent } from './sound-command.component';

describe('SoundComponentComponent', () => {
  let component: SoundCommandComponent;
  let fixture: ComponentFixture<SoundCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundCommandComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SoundCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
