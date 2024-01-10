import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainCommandComponent } from './chain-command.component';

describe('ChainCommandComponent', () => {
  let component: ChainCommandComponent;
  let fixture: ComponentFixture<ChainCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChainCommandComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChainCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
