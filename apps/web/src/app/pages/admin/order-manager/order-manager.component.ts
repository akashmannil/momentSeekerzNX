import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StoreActions, selectOrders, selectStoreLoading } from '@mss/data-access';
import { Order, OrderStatus } from '@mss/shared';

@Component({
  selector: 'mss-order-manager',
  templateUrl: './order-manager.component.html',
})
export class OrderManagerComponent implements OnInit {
  orders$: Observable<Order[]> = this.store.select(selectOrders);
  loading$: Observable<boolean> = this.store.select(selectStoreLoading);
  statuses = Object.values(OrderStatus);

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(StoreActions.loadOrders({}));
  }
}
