import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product, CartItem, Order } from '@mss/shared';

export const StoreActions = createActionGroup({
  source: 'Store',
  events: {
    // Products
    'Load Products': props<{ page?: number; featured?: boolean }>(),
    'Load Products Success': props<{ products: Product[]; total: number; pages: number }>(),
    'Load Products Failure': props<{ error: string }>(),

    'Load Product': props<{ id: string }>(),
    'Load Product Success': props<{ product: Product }>(),

    // Cart
    'Add To Cart': props<{ item: CartItem }>(),
    'Remove From Cart': props<{ productId: string; size: string; finish: string }>(),
    'Update Cart Quantity': props<{ productId: string; size: string; finish: string; quantity: number }>(),
    'Clear Cart': emptyProps(),

    // Checkout
    'Checkout': props<{ customerEmail: string; customerName: string }>(),
    'Checkout Success': props<{ checkoutUrl: string }>(),
    'Checkout Failure': props<{ error: string }>(),

    // Orders (admin)
    'Load Orders': props<{ page?: number }>(),
    'Load Orders Success': props<{ orders: Order[]; total: number }>(),
  },
});
