import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOutboundSourceComponent } from './edit-outbound-source.component';

describe('EditOutboundSourceComponent', () => {
  let component: EditOutboundSourceComponent;
  let fixture: ComponentFixture<EditOutboundSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOutboundSourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditOutboundSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
