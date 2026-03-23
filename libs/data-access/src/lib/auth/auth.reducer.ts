import { createReducer, on } from '@ngrx/store';
import { User } from '@mss/shared';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: Pick<User, '_id' | 'email' | 'name' | 'role'> | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const authInitialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  authInitialState,

  on(AuthActions.login, AuthActions.register, state => ({
    ...state, loading: true, error: null,
  })),

  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state,
    user,
    accessToken,
    refreshToken,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  on(AuthActions.logoutSuccess, AuthActions.sessionExpired, () => authInitialState),

  on(AuthActions.sessionRestored, (state, { user, accessToken }) => ({
    ...state, user, accessToken,
  })),

  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({
    ...state, accessToken, refreshToken,
  })),

  on(AuthActions.refreshTokenFailure, () => authInitialState)
);
