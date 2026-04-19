import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Product, CartItem, Order } from '@sm/shared';
import { StoreActions } from './store.actions';

export interface StoreState extends EntityState<Product> {
  cart: CartItem[];
  orders: Order[];
  pagination: { total: number; pages: number };
  loading: boolean;
  checkingOut: boolean;
  error: string | null;
}

const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId: p => p._id,
});

export const storeInitialState: StoreState = productAdapter.getInitialState({
  cart: [],
  orders: [],
  pagination: { total: 0, pages: 0 },
  loading: false,
  checkingOut: false,
  error: null,
});

export const storeReducer = createReducer(
  storeInitialState,

  on(StoreActions.loadProducts, state => ({ ...state, loading: true })),
  on(StoreActions.loadProductsSuccess, (state, { products, total, pages }) =>
    productAdapter.setAll(products, { ...state, loading: false, pagination: { total, pages } })
  ),
  on(StoreActions.loadProductsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(StoreActions.loadProductSuccess, (state, { product }) =>
    productAdapter.upsertOne(product, state)
  ),

  on(StoreActions.addToCart, (state, { item }) => {
    const existingIndex = state.cart.findIndex(
      c => c.productId === item.productId && c.size === item.size && c.finish === item.finish
    );
    if (existingIndex >= 0) {
      const cart = [...state.cart];
      cart[existingIndex] = { ...cart[existingIndex], quantity: cart[existingIndex].quantity + item.quantity };
      return { ...state, cart };
    }
    return { ...state, cart: [...state.cart, item] };
  }),

  on(StoreActions.removeFromCart, (state, { productId, size, finish }) => ({
    ...state,
    cart: state.cart.filter(c => !(c.productId === productId && c.size === size && c.finish === finish)),
  })),

  on(StoreActions.updateCartQuantity, (state, { productId, size, finish, quantity }) => ({
    ...state,
    cart: state.cart.map(c =>
      c.productId === productId && c.size === size && c.finish === finish
        ? { ...c, quantity }
        : c
    ),
  })),

  on(StoreActions.clearCart, state => ({ ...state, cart: [] })),

  on(StoreActions.checkout, state => ({ ...state, checkingOut: true, error: null })),
  on(StoreActions.checkoutSuccess, state => ({ ...state, checkingOut: false })),
  on(StoreActions.checkoutFailure, (state, { error }) => ({ ...state, checkingOut: false, error })),

  on(StoreActions.loadOrdersSuccess, (state, { orders, total }) => ({
    ...state, orders, pagination: { ...state.pagination, total },
  }))
);

export const { selectAll: selectAllProducts, selectEntities: selectProductEntities } =
  productAdapter.getSelectors();
