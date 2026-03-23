import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '@mss/shared';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ user: Pick<User, '_id' | 'email' | 'name' | 'role'>; accessToken: string; refreshToken: string }>(),
    'Login Failure': props<{ error: string }>(),

    // Register
    'Register': props<{ email: string; name: string; password: string }>(),
    'Register Success': props<{ user: Pick<User, '_id' | 'email' | 'name' | 'role'>; accessToken: string; refreshToken: string }>(),
    'Register Failure': props<{ error: string }>(),

    // Logout
    'Logout': emptyProps(),
    'Logout Success': emptyProps(),

    // Refresh token
    'Refresh Token': props<{ userId: string; refreshToken: string }>(),
    'Refresh Token Success': props<{ accessToken: string; refreshToken: string }>(),
    'Refresh Token Failure': emptyProps(),

    // Restore from storage
    'Restore Session': emptyProps(),
    'Session Restored': props<{ user: Pick<User, '_id' | 'email' | 'name' | 'role'>; accessToken: string }>(),
    'Session Expired': emptyProps(),
  },
});
