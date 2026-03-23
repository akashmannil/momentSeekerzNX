import { createReducer, on } from '@ngrx/store';
import { UiActions } from './ui.actions';

export interface UiState {
  loading: boolean;
  activeModal: { id: string; data?: Record<string, unknown> } | null;
  theme: 'dark' | 'light';
  navOpen: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  sceneReady: boolean;
}

export const uiInitialState: UiState = {
  loading: false,
  activeModal: null,
  theme: 'dark',
  navOpen: false,
  toast: null,
  sceneReady: false,
};

export const uiReducer = createReducer(
  uiInitialState,
  on(UiActions.setLoading, (state, { loading }) => ({ ...state, loading })),
  on(UiActions.openModal, (state, { id, data }) => ({ ...state, activeModal: { id, data } })),
  on(UiActions.closeModal, state => ({ ...state, activeModal: null })),
  on(UiActions.setTheme, (state, { theme }) => ({ ...state, theme })),
  on(UiActions.setNavOpen, (state, { open }) => ({ ...state, navOpen: open })),
  on(UiActions.showToast, (state, { message, type }) => ({ ...state, toast: { message, type } })),
  on(UiActions.clearToast, state => ({ ...state, toast: null })),
  on(UiActions.setSceneReady, (state, { ready }) => ({ ...state, sceneReady: ready }))
);
