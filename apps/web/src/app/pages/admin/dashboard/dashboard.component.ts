import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface DashboardStats {
  summary: {
    totalPhotos: number;
    totalBookings: number;
    pendingBookings: number;
    recentOrders: number;
    revenueThisMonth: number;
    ordersThisMonth: number;
  };
  topPhotos: { title: string; viewCount: number; category: string; thumbnailUrl: string }[];
  bookingsByStatus: { status: string; count: number }[];
}

@Component({
  selector: 'sm-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.get<DashboardStats>('/analytics/dashboard').subscribe({
      next: data => { this.stats = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
