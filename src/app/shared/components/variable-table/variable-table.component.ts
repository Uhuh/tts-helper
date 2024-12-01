import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-variable-table',
    imports: [CommonModule],
    templateUrl: './variable-table.component.html',
    styleUrl: './variable-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariableTableComponent {
  @Input({ required: true }) variables: VariableTableOption[] = [];
}

export type VariableTableOption = {
  variable: string,
  descriptor: string,
};