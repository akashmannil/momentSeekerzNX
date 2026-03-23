import { PrintFinish, PrintSize, OrderStatus } from '../enums';

export interface ProductVariant {
  size: PrintSize;
  finish: PrintFinish;
  price: number;
  stock: number;
  sku: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  photoId?: string;
  variants: ProductVariant[];
  tags: string[];
  published: boolean;
  featured: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  title: string;
  imageUrl: string;
  size: PrintSize;
  finish: PrintFinish;
  quantity: number;
  unitPrice: number;
  sku: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  imageUrl: string;
  size: string;
  finish: string;
  quantity: number;
  unitPrice: number;
  sku: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
