import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonPollyComponent } from './amazon-polly.component';

describe('AmazonPollyComponent', () => {
  let component: AmazonPollyComponent;
  let fixture: ComponentFixture<AmazonPollyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmazonPollyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonPollyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
