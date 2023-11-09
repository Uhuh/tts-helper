import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzureSttComponent } from './azure-stt.component';

describe('AzureSttComponent', () => {
  let component: AzureSttComponent;
  let fixture: ComponentFixture<AzureSttComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AzureSttComponent]
    });
    fixture = TestBed.createComponent(AzureSttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
