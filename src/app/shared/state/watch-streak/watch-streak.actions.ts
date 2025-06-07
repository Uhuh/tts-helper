import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserStreakInfo, WatchStreakFeatureState } from './watch-streak.feature';

export const WatchStreakActions = createActionGroup({
  source: 'WatchStreak',
  events: {
    'Update State': props<{ partialState: Partial<WatchStreakFeatureState> }>(),
    'Update Users Watch Date': props<{ user: Partial<UserStreakInfo> }>(),
    'Log Stream Start': emptyProps(),
  },
});