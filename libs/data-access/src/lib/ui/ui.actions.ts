import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const UiActions = createActionGroup({
  source: 'UI',
  events: {
    'Set Loading': props<{ loading: boolean }>(),
    'Open Modal': props<{ id: string; data?: Record<string, unknown> }>(),
    'Close Modal': emptyProps(),
    'Set Theme': props<{ theme: 'dark' | 'light' }>(),
    'Set Nav Open': props<{ open: boolean }>(),
    'Show Toast': props<{ message: string; toastType: 'success' | 'error' | 'info' }>(),
    'Clear Toast': emptyProps(),
    'Set Scene Ready': props<{ ready: boolean }>(),
  },
});
