import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogDialogComponent } from './changelog-dialog.component';

describe('ChangelogDialogComponent', () => {
  let component: ChangelogDialogComponent;
  let fixture: ComponentFixture<ChangelogDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangelogDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChangelogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
