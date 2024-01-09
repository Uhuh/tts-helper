import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandsComponent } from './commands.component';

describe('ChatCommandsComponent', () => {
  let component: CommandsComponent;
  let fixture: ComponentFixture<CommandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandsComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
