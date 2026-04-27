import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface RequestLogEntry {
  _id: string;
  requestId: string;
  method: string;
  path: string;
  query?: string;
  statusCode: number;
  level: 'info' | 'warn' | 'error';
  durationMs: number;
  userId?: string;
  guestSid?: string;
  ip?: string;
  userAgent?: string;
  responseSize?: number;
  requestBody?: unknown;
  requestHeaders?: Record<string, string>;
  responseBody?: unknown;
  errorMessage?: string;
  errorStack?: string;
  createdAt: string;
}

interface LogsResponse {
  data: RequestLogEntry[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'sm-logs-viewer',
  template: `
    <div class="p-8 max-w-[1400px] mx-auto">
      <div class="flex items-end justify-between mb-6">
        <div>
          <p class="section-label text-gold-400">Observability</p>
          <h1 class="font-display text-4xl mt-2">Request Logs</h1>
          <p class="text-white/40 text-sm mt-1 font-body">
            Failed requests show full request/response. Successful requests show summary only.
          </p>
        </div>
        <button (click)="reload()" class="btn-ghost text-xs" [disabled]="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6 p-4 bg-obsidian-900 border border-white/10">
        <div>
          <label class="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Level</label>
          <select [(ngModel)]="filters.level" (change)="reload()"
                  class="w-full bg-obsidian-950 border border-white/10 px-2 py-1.5 text-xs">
            <option [ngValue]="undefined">All</option>
            <option value="info">info</option>
            <option value="warn">warn (4xx)</option>
            <option value="error">error (5xx)</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Method</label>
          <select [(ngModel)]="filters.method" (change)="reload()"
                  class="w-full bg-obsidian-950 border border-white/10 px-2 py-1.5 text-xs">
            <option [ngValue]="undefined">All</option>
            <option *ngFor="let m of methods" [value]="m">{{ m }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Status</label>
          <input [(ngModel)]="filters.status" (change)="reload()" type="number" placeholder="e.g. 500"
                 class="w-full bg-obsidian-950 border border-white/10 px-2 py-1.5 text-xs"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Path contains</label>
          <input [(ngModel)]="filters.path" (keyup.enter)="reload()" placeholder="/cart"
                 class="w-full bg-obsidian-950 border border-white/10 px-2 py-1.5 text-xs"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-widest uppercase text-white/40 mb-1">From</label>
          <input [(ngModel)]="filters.from" (change)="reload()" type="datetime-local"
                 class="w-full bg-obsidian-950 border border-white/10 px-2 py-1.5 text-xs"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-widest uppercase text-white/40 mb-1">To</label>
          <input [(ngModel)]="filters.to" (change)="reload()" type="datetime-local"
                 class="w-full bg-obsidian-950 border border-white/10 px-2 py-1.5 text-xs"/>
        </div>
      </div>

      <div class="flex gap-2 mb-4">
        <button (click)="quickFilter('errors')" class="btn-ghost text-xs">Errors only (≥400)</button>
        <button (click)="quickFilter('5xx')" class="btn-ghost text-xs">5xx only</button>
        <button (click)="quickFilter('clear')" class="btn-ghost text-xs">Clear filters</button>
      </div>

      <!-- Table -->
      <div class="border border-white/10 bg-obsidian-900 overflow-x-auto">
        <table class="w-full text-xs font-mono">
          <thead class="bg-obsidian-950 text-white/40 uppercase tracking-widest">
            <tr>
              <th class="text-left py-2 px-3 w-32">Time</th>
              <th class="text-left py-2 px-3 w-16">Method</th>
              <th class="text-left py-2 px-3 w-16">Status</th>
              <th class="text-left py-2 px-3">Path</th>
              <th class="text-right py-2 px-3 w-20">Duration</th>
              <th class="text-left py-2 px-3 w-32">User</th>
              <th class="text-left py-2 px-3 w-24">Request ID</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let log of logs">
              <tr (click)="toggle(log)"
                  class="border-t border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                <td class="py-2 px-3 text-white/60">{{ log.createdAt | date:'MMM d HH:mm:ss' }}</td>
                <td class="py-2 px-3 text-white/80">{{ log.method }}</td>
                <td class="py-2 px-3" [ngClass]="statusClass(log.statusCode)">{{ log.statusCode }}</td>
                <td class="py-2 px-3 text-white/80 truncate max-w-[400px]">{{ log.path }}{{ log.query ? '?' + log.query : '' }}</td>
                <td class="py-2 px-3 text-right text-white/60">{{ log.durationMs }}ms</td>
                <td class="py-2 px-3 text-white/40 truncate">{{ log.userId || (log.guestSid ? 'guest' : '—') }}</td>
                <td class="py-2 px-3 text-white/30 truncate">{{ log.requestId.slice(0, 8) }}</td>
              </tr>
              <tr *ngIf="expanded === log._id" class="border-t border-white/5 bg-obsidian-950">
                <td colspan="7" class="p-4 align-top">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p class="section-label mb-2">Metadata</p>
                      <pre class="text-[11px] text-white/70 whitespace-pre-wrap break-all">{{ metadata(log) }}</pre>
                    </div>
                    <div *ngIf="log.errorMessage">
                      <p class="section-label mb-2 text-red-400">Error</p>
                      <pre class="text-[11px] text-red-300 whitespace-pre-wrap break-all">{{ log.errorMessage }}</pre>
                      <pre *ngIf="log.errorStack" class="text-[10px] text-white/40 whitespace-pre-wrap break-all mt-2">{{ log.errorStack }}</pre>
                    </div>
                    <div *ngIf="log.requestHeaders">
                      <p class="section-label mb-2">Request Headers</p>
                      <pre class="text-[11px] text-white/70 whitespace-pre-wrap break-all">{{ pretty(log.requestHeaders) }}</pre>
                    </div>
                    <div *ngIf="log.requestBody">
                      <p class="section-label mb-2">Request Body</p>
                      <pre class="text-[11px] text-white/70 whitespace-pre-wrap break-all">{{ pretty(log.requestBody) }}</pre>
                    </div>
                    <div *ngIf="log.responseBody" class="lg:col-span-2">
                      <p class="section-label mb-2">Response Body</p>
                      <pre class="text-[11px] text-white/70 whitespace-pre-wrap break-all">{{ pretty(log.responseBody) }}</pre>
                    </div>
                    <div *ngIf="!log.requestBody && !log.responseBody && !log.errorMessage" class="lg:col-span-2 text-white/40 text-xs italic">
                      Successful request — only summary metadata is stored.
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="!loading && logs.length === 0">
              <td colspan="7" class="py-12 text-center text-white/40">No logs match these filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4 text-xs text-white/60">
        <div>
          Showing {{ logs.length ? (page - 1) * limit + 1 : 0 }}–{{ (page - 1) * limit + logs.length }}
          of {{ total }}
        </div>
        <div class="flex gap-2">
          <button (click)="prev()" [disabled]="page <= 1 || loading" class="btn-ghost text-xs">Prev</button>
          <span class="px-3 py-1">Page {{ page }} / {{ totalPages }}</span>
          <button (click)="next()" [disabled]="page >= totalPages || loading" class="btn-ghost text-xs">Next</button>
        </div>
      </div>
    </div>
  `,
})
export class LogsViewerComponent implements OnInit {
  logs: RequestLogEntry[] = [];
  total = 0;
  page = 1;
  limit = 50;
  loading = false;
  expanded: string | null = null;

  methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];

  filters: {
    level?: 'info' | 'warn' | 'error';
    method?: string;
    status?: number;
    minStatus?: number;
    path?: string;
    from?: string;
    to?: string;
  } = {};

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.reload();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  reload(): void {
    this.loading = true;
    const params: Record<string, string> = {
      page: String(this.page),
      limit: String(this.limit),
    };
    if (this.filters.level) params['level'] = this.filters.level;
    if (this.filters.method) params['method'] = this.filters.method;
    if (this.filters.status) params['status'] = String(this.filters.status);
    if (this.filters.minStatus) params['minStatus'] = String(this.filters.minStatus);
    if (this.filters.path) params['path'] = this.filters.path;
    if (this.filters.from) params['from'] = new Date(this.filters.from).toISOString();
    if (this.filters.to) params['to'] = new Date(this.filters.to).toISOString();

    this.api.get<LogsResponse>('/logs', params).subscribe({
      next: (res) => {
        this.logs = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  toggle(log: RequestLogEntry): void {
    this.expanded = this.expanded === log._id ? null : log._id;
  }

  quickFilter(kind: 'errors' | '5xx' | 'clear'): void {
    this.filters = {};
    if (kind === 'errors') this.filters.minStatus = 400;
    if (kind === '5xx') this.filters.minStatus = 500;
    this.page = 1;
    this.reload();
  }

  prev(): void {
    if (this.page > 1) {
      this.page--;
      this.reload();
    }
  }

  next(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.reload();
    }
  }

  statusClass(status: number): string {
    if (status >= 500) return 'text-red-400';
    if (status >= 400) return 'text-yellow-400';
    if (status >= 300) return 'text-blue-300';
    return 'text-green-400';
  }

  pretty(value: unknown): string {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  metadata(log: RequestLogEntry): string {
    return this.pretty({
      requestId: log.requestId,
      ip: log.ip,
      userAgent: log.userAgent,
      userId: log.userId,
      guestSid: log.guestSid ? log.guestSid.slice(0, 8) + '…' : undefined,
      responseSize: log.responseSize,
      durationMs: log.durationMs,
    });
  }
}
