import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VstreamComponent } from './vstream.component';

describe('VstreamComponent', () => {
  let component: VstreamComponent;
  let fixture: ComponentFixture<VstreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VstreamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VstreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
