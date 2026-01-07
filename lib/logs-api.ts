const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Log {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  correlationId: string;
  message: string;
  userId?: string;
  meta?: Record<string, unknown>;
}

export interface PaginatedLogs {
  logs: Log[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface LogStatistics {
  totalLogs: number;
  levelBreakdown: Array<{
    level: string;
    count: number;
  }>;
}

export interface LogTrend {
  date: string;
  totalCount: number;
  levels: Array<{
    level: string;
    count: number;
  }>;
}

interface LogFilters {
  page?: number;
  limit?: number;
  level?: string;
  correlationId?: string;
  userId?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
}

class LogsApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getLogs(filters: LogFilters = {}): Promise<PaginatedLogs> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/api/logs?${params.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error: any = new Error('Failed to fetch logs');
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data;
  }

  async getLogsByCorrelationId(correlationId: string): Promise<Log[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/logs/correlation/${correlationId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error: any = new Error('Failed to fetch logs');
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data;
  }

  async getLogStatistics(): Promise<LogStatistics> {
    const response = await fetch(`${API_BASE_URL}/api/logs/statistics`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error: any = new Error('Failed to fetch statistics');
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data;
  }

  async getRecentErrors(limit: number = 20): Promise<Log[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/logs/errors?limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error: any = new Error('Failed to fetch errors');
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data;
  }

  async getLogTrends(days: number = 7): Promise<LogTrend[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/logs/trends?days=${days}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error: any = new Error('Failed to fetch trends');
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data;
  }

  async clearOldLogs(days: number = 30): Promise<{ deletedCount: number }> {
    const response = await fetch(
      `${API_BASE_URL}/api/logs/clear?days=${days}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error: any = new Error('Failed to clear logs');
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data;
  }
}

export const logsApiClient = new LogsApiClient();

