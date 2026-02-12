import type {
  ApiResponse,
  Course,
  FeedFilters,
  TeeTime,
  TeeTimeCreateInput,
  User,
  Message,
  Notification,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse response',
      },
    }));

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  // Tee Times
  async getTeeTimeFeed(
    filters: FeedFilters = {},
    cursor?: string,
    limit: number = 20
  ): Promise<ApiResponse<TeeTime[]>> {
    const params = new URLSearchParams();

    if (filters.courseId) params.set('courseId', filters.courseId);
    if (filters.hostId) params.set('hostId', filters.hostId);
    if (filters.status) params.set('status', filters.status);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.skillLevel) params.set('skillLevel', filters.skillLevel);
    if (filters.latitude !== undefined) params.set('latitude', filters.latitude.toString());
    if (filters.longitude !== undefined) params.set('longitude', filters.longitude.toString());
    if (filters.radius) params.set('radius', filters.radius.toString());
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    if (filters.hasAvailableSlots !== undefined) {
      params.set('hasAvailableSlots', filters.hasAvailableSlots.toString());
    }
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());

    return this.request<ApiResponse<TeeTime[]>>(`/api/tee-times?${params.toString()}`);
  }

  async getRecommendedTeeTimes(): Promise<ApiResponse<TeeTime[]>> {
    return this.request<ApiResponse<TeeTime[]>>('/api/tee-times/recommended');
  }

  async getTeeTime(id: string): Promise<ApiResponse<TeeTime>> {
    return this.request<ApiResponse<TeeTime>>(`/api/tee-times/${id}`);
  }

  async createTeeTime(input: TeeTimeCreateInput): Promise<ApiResponse<TeeTime>> {
    return this.request<ApiResponse<TeeTime>>('/api/tee-times', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateTeeTime(
    id: string,
    data: Partial<TeeTimeCreateInput> & { status?: string }
  ): Promise<ApiResponse<TeeTime>> {
    return this.request<ApiResponse<TeeTime>>(`/api/tee-times/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeeTime(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(`/api/tee-times/${id}`, {
      method: 'DELETE',
    });
  }

  async joinTeeTime(teeTimeId: string, slotNumber?: number): Promise<ApiResponse<TeeTime>> {
    return this.request<ApiResponse<TeeTime>>(`/api/tee-times/${teeTimeId}/join`, {
      method: 'POST',
      body: JSON.stringify({ slotNumber }),
    });
  }

  async leaveTeeTime(teeTimeId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(`/api/tee-times/${teeTimeId}/leave`, {
      method: 'DELETE',
    });
  }

  // Tee Time Messages
  async getTeeTimeMessages(
    teeTimeId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<ApiResponse<Message[]>> {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());

    return this.request<ApiResponse<Message[]>>(
      `/api/tee-times/${teeTimeId}/messages?${params.toString()}`
    );
  }

  async sendTeeTimeMessage(teeTimeId: string, content: string): Promise<ApiResponse<Message>> {
    return this.request<ApiResponse<Message>>(`/api/tee-times/${teeTimeId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Courses
  async getCourses(
    query?: string,
    latitude?: number,
    longitude?: number,
    radius: number = 50,
    courseType?: string,
    cursor?: string,
    limit: number = 20
  ): Promise<ApiResponse<Course[]>> {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (latitude !== undefined) params.set('latitude', latitude.toString());
    if (longitude !== undefined) params.set('longitude', longitude.toString());
    params.set('radius', radius.toString());
    if (courseType) params.set('courseType', courseType);
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());

    return this.request<ApiResponse<Course[]>>(`/api/courses?${params.toString()}`);
  }

  async getCourseBySlug(slug: string): Promise<ApiResponse<Course>> {
    return this.request<ApiResponse<Course>>(`/api/courses/${slug}`);
  }

  async toggleFavoriteCourse(courseId: string): Promise<ApiResponse<{ isFavorited: boolean }>> {
    return this.request<ApiResponse<{ isFavorited: boolean }>>(`/api/courses/${courseId}/favorite`, {
      method: 'POST',
    });
  }

  // Users
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/api/users/me');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserTeeTimes(): Promise<ApiResponse<TeeTime[]>> {
    return this.request<ApiResponse<TeeTime[]>>('/api/users/me/tee-times');
  }

  async getUserFavorites(): Promise<ApiResponse<Course[]>> {
    return this.request<ApiResponse<Course[]>>('/api/users/me/favorites');
  }

  // Notifications
  async getNotifications(
    unreadOnly: boolean = false,
    cursor?: string,
    limit: number = 20
  ): Promise<ApiResponse<Notification[]>> {
    const params = new URLSearchParams();
    params.set('unreadOnly', unreadOnly.toString());
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());

    return this.request<ApiResponse<Notification[]>>(`/api/users/me/notifications?${params.toString()}`);
  }

  async markNotificationRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request<ApiResponse<Notification>>(`/api/users/me/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>('/api/users/me/notifications/read-all', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient(API_URL);

export default api;
