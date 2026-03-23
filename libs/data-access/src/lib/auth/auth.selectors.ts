import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(selectAuthState, s => s.user);
export const selectAccessToken = createSelector(selectAuthState, s => s.accessToken);
export const selectIsAuthenticated = createSelector(selectAuthState, s => !!s.user && !!s.accessToken);
export const selectIsAdmin = createSelector(selectAuthState, s => s.user?.role === 'admin');
export const selectAuthLoading = createSelector(selectAuthState, s => s.loading);
export const selectAuthError = createSelector(selectAuthState, s => s.error);
