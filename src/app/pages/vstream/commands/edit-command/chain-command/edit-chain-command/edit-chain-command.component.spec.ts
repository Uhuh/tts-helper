import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChainCommandComponent } from './edit-chain-command.component';

describe('EditChainCommandComponent', () => {
  let component: EditChainCommandComponent;
  let fixture: ComponentFixture<EditChainCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditChainCommandComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditChainCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
