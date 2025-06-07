import { createFeature, createReducer, on } from '@ngrx/store';
import { WatchStreakActions } from './watch-streak.actions';


export type UserStreakInfo = {
  userId: string;
  userName: string;
  currentStreak: number;
  highestStreak: number;
  lastCheckedInDate: string; // Date().toDateString();
  /**
   * Keep track of how many times they missed stream in total. Not related to resetting their streak.
   */
  // totalMissedStreams: number;
  /**
   * How many times a user has missed a stream since last.
   * What if we just compared their lastCheckedInDate against pastStreamDates against the threshold?
   */
  // currentMissedStreak: number;
};

const defaultUserStreakInfo: UserStreakInfo = {
  userId: '',
  currentStreak: 1,
  highestStreak: 1,
  userName: '',
  lastCheckedInDate: new Date().toDateString(),
};

export type WatchStreakFeatureState = {
  userStreaks: UserStreakInfo[];
  /**
   * I'm thinking that this will just be a set of MM/DD/YYYY format
   *
   * If the array is empty (so no previous date to check), just ignore and update users current date me thinks.
   */
  pastStreamDates: string[];

  /**
   * How many days a viewer can miss stream before their streak resets.
   */
  gracePeriodDays: number;

  /**
   * How many points a viewer gets when they check in the stream.
   */
  pointsPerStreak: number,

  /**
   * Configurable number of bonus points for "VIP" users.
   */
  bonusPointsPerStreak: number;
};

const initialState: WatchStreakFeatureState = {
  userStreaks: [],
  pastStreamDates: [],
  gracePeriodDays: 0,
  pointsPerStreak: 1,
  bonusPointsPerStreak: 0,
};

export const WatchStreakFeature = createFeature({
  name: 'WatchStreakFeature',
  reducer: createReducer(
    initialState,
    on(WatchStreakActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
    on(WatchStreakActions.updateUsersWatchDate, (state, { user }) => {
      const userToUpdate = state.userStreaks.find(u => u.userId === user.userId);
      const copyOfUsers = state.userStreaks.slice();
      const indexOfUser = copyOfUsers.findIndex(u => u.userId === user.userId);

      if (!userToUpdate) {
        return {
          ...state,
          userStreaks: [...state.userStreaks, { ...defaultUserStreakInfo, ...user }],
        };
      }

      const gracePeriodDays = state.gracePeriodDays;
      const lastCheckedInDate = userToUpdate.lastCheckedInDate;
      const currentUserStreak = userToUpdate.currentStreak;

      if (lastCheckedInDate === new Date().toDateString()) {
        return state;
      }

      let hasWatchedWithinGracePeriod = false;

      for (let i = 1; i <= gracePeriodDays; i++) {
        const streamLength = state.pastStreamDates.length;
        const previousStreamDate = state.pastStreamDates[streamLength - i] ?? -1;

        if (new Date(lastCheckedInDate) >= new Date(previousStreamDate)) {
          hasWatchedWithinGracePeriod = true;
          break;
        }
      }

      const nextStreak = currentUserStreak + 1;

      copyOfUsers[indexOfUser] = {
        ...userToUpdate,
        ...user,
        lastCheckedInDate: new Date().toDateString(),
        currentStreak: hasWatchedWithinGracePeriod ? nextStreak : 0,
        highestStreak: nextStreak > userToUpdate.highestStreak ? nextStreak : userToUpdate.highestStreak,
      };

      return {
        ...state,
        userStreaks: [...copyOfUsers],
      };
    }),
    on(WatchStreakActions.logStreamStart, (state) => ({
      ...state,
      pastStreamDates: [...new Set([...state.pastStreamDates, new Date().toDateString()])],
    })),
  ),
});