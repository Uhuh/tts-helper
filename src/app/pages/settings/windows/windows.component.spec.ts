import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowsComponent } from './windows.component';

describe('WindowsComponent', () => {
  let component: WindowsComponent;
  let fixture: ComponentFixture<WindowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WindowsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WindowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
