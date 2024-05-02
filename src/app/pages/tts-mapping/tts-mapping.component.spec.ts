import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsMappingComponent } from './tts-mapping.component';

describe('TtsMappingComponent', () => {
  let component: TtsMappingComponent;
  let fixture: ComponentFixture<TtsMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TtsMappingComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TtsMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
