const ENV_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = ENV_API_URL.endsWith('/api/v1') ? ENV_API_URL : `${ENV_API_URL}/api/v1`;

class ApiClient {
    private token: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('access_token');
            this.refreshToken = localStorage.getItem('refresh_token');
        }
    }

    setTokens(accessToken: string, refreshToken: string) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
        }
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as any)['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Handle 401 Unauthorized - potentially try refresh token logic here
            // For MVP Phase 1, we'll just throw the error
            if (response.status === 401) {
                console.warn('Unauthorized request. Token might be expired.');
                // Optional: this.clearTokens(); window.location.href = '/login'; 
            }
            throw {
                status: response.status,
                message: data.detail || data.error?.message || 'API Error',
                data
            };
        }

        return data as T;
    }

    // --- Authentication ---
    auth = {
        requestEmailOTP: (email: string) =>
            this.request<{ success: boolean }>('/auth/email/otp/request', {
                method: 'POST',
                body: JSON.stringify({ email }),
            }),

        verifyEmailOTP: (email: string, code: string) =>
            this.request<{ tokens: { access_token: string; refresh_token: string }; user: any; driver: any }>('/auth/email/otp/verify', {
                method: 'POST',
                body: JSON.stringify({ email, code }),
            }),

        requestMagicLink: (email: string) =>
            this.request('/auth/magic-link/request', {
                method: 'POST',
                body: JSON.stringify({ email }),
            }),

        getMe: () => this.request('/auth/me'),

        logout: () => {
            this.clearTokens();
            // Call backend logout if endpoint exists, otherwise just clear local
            // return this.request('/auth/logout', { method: 'POST' });
        }
    };

    // --- Drivers ---
    drivers = {
        create: (profileData: { handle: string; avatar_id: string; status: string }) =>
            this.request<any>('/drivers', {
                method: 'POST',
                body: JSON.stringify(profileData),
            }),

        getMe: () => this.request<any>('/drivers/me'),

        updateStatus: (status: 'rolling' | 'waiting' | 'parked') =>
            this.request('/drivers/me/status', {
                method: 'POST',
                body: JSON.stringify({ status }),
            }),

        updateLocation: (data: { latitude: number; longitude: number; heading?: number; speed?: number }) =>
            this.request('/locations/check-in', {
                method: 'POST',
                body: JSON.stringify(data)
            })
    };

    // --- Map Data ---
    map = {
        getDrivers: (params: { latitude: number; longitude: number; radius_miles: number; status_filter?: string }) => {
            const query = new URLSearchParams(params as any).toString();
            return this.request<{ drivers: any[] }>(`/map/drivers?${query}`);
        },

        getClusters: (params: { latitude: number; longitude: number; radius_miles: number; min_drivers?: number }) => {
            const query = new URLSearchParams(params as any).toString();
            return this.request<{ clusters: any[] }>(`/map/clusters?${query}`);
        },

        getHotspots: (params: { latitude: number; longitude: number; radius_miles: number }) => {
            const query = new URLSearchParams(params as any).toString();
            return this.request<{ hotspots: any[] }>(`/map/hotspots?${query}`);
        },

        getStats: (params: { latitude: number; longitude: number; radius_miles: number }) => {
            const query = new URLSearchParams(params as any).toString();
            return this.request<{ stats: any }>(`/map/stats?${query}`);
        }
    };
}

export const api = new ApiClient();
