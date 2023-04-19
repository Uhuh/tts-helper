import { FormControl, FormControlOptions } from '@angular/forms';

export function nonNullFormControl<T>(
  initial: T,
  options?: FormControlOptions
) {
  return new FormControl(initial, { ...options, nonNullable: true });
}
