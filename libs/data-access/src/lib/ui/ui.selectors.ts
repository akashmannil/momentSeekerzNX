import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.reducer';

export const selectUiState = createFeatureSelector<UiState>('ui');

export const selectLoading = createSelector(selectUiState, s => s.loading);
export const selectActiveModal = createSelector(selectUiState, s => s.activeModal);
export const selectTheme = createSelector(selectUiState, s => s.theme);
export const selectNavOpen = createSelector(selectUiState, s => s.navOpen);
export const selectToast = createSelector(selectUiState, s => s.toast);
export const selectSceneReady = createSelector(selectUiState, s => s.sceneReady);
