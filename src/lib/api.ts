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

    get isLoggedIn(): boolean {
        return !!this.token;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
        const headers: HeadersInit = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers,
        };

        if (this.token) {
            (headers as any)['Authorization'] = `Bearer ${this.token}`;
        }

        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers,
            });
        } catch (error) {
            // Log as warning to avoid cluttering console in dev (e.g. backend down)
            console.warn(`[ApiClient] Network request failed for ${endpoint}`);
            throw {
                status: 0,
                message: 'Network error. Please check your connection or backend server.',
                data: null
            };
        }

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

        signup: (email: string, password: string) =>
            this.request<{ tokens: { access_token: string; refresh_token: string }; user: any; driver: any }>('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),

        login: (email: string, password: string) =>
            this.request<{ tokens: { access_token: string; refresh_token: string }; user: any; driver: any }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),

        resetPassword: (email: string) =>
            this.request<{ success: boolean }>('/auth/password/reset-request', {
                method: 'POST',
                body: JSON.stringify({ email }),
            }),

        confirmResetPassword: (access_token: string, new_password: string) =>
            this.request<{ success: boolean }>('/auth/password/reset-confirm', {
                method: 'POST',
                body: JSON.stringify({ access_token, new_password }),
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
        create: (profileData: { handle: string; avatar_id: string; status: string; role?: string; cb_handle?: string }) =>
            this.request<any>('/drivers', {
                method: 'POST',
                body: JSON.stringify(profileData),
            }),

        getMe: () => this.request<any>('/drivers/me'),

        getCBHandleSuggestions: () =>
            this.request<{ suggestions: string[] }>('/drivers/cb-handle/suggestions'),

        checkCBHandle: (cb_handle: string) =>
            this.request<{ available: boolean }>('/drivers/cb-handle/check', {
                method: 'POST',
                body: JSON.stringify({ cb_handle }),
            }),

        updateStatus: (status: 'rolling' | 'waiting' | 'parked', location?: { latitude: number; longitude: number }) =>
            this.request<{
                status_update_id: string;
                status: string;
                location?: {
                    latitude: number;
                    longitude: number;
                    facility_name: string | null;
                };
                follow_up_question: any | null;
                weather_info: any | null; // Added for dual questions
                message: string;
            }>('/drivers/me/status', {
                method: 'POST',
                body: JSON.stringify({ status, ...location }),
            }),

        getStats: () => this.request<any>('/drivers/me/stats'),

        updateProfile: (data: { handle?: string; avatar_id?: string; role?: string; profile_photo_url?: string }) =>
            this.request<any>('/drivers/me/profile', {
                method: 'PATCH',
                body: JSON.stringify(data)
            }),

        deleteAccount: (data: { confirmation: string; reason?: string }) =>
            this.request<any>('/drivers/me', {
                method: 'DELETE',
                body: JSON.stringify(data)
            }),

        updateLocation: (data: { latitude: number; longitude: number; heading?: number; speed?: number; accuracy?: number }) =>
            this.request('/locations/check-in', {
                method: 'POST',
                body: JSON.stringify(data)
            }),

        appOpen: (data: { latitude: number; longitude: number; heading?: number; speed?: number; accuracy?: number }) =>
            this.request<{
                action: "prompt_status" | "none";
                reason: string | null;
                message: string;
                current_status: string;
                suggested_status?: string;
            }>('/locations/app-open', {
                method: 'POST',
                body: JSON.stringify(data)
            })
    };

    followUps = {
        respond: (data: { status_update_id: string; response_value: string; response_text?: string }) =>
            this.request<{ success: boolean; message: string; status_corrected?: boolean; new_status?: string }>('/follow-ups/respond', {
                method: 'POST',
                body: JSON.stringify(data)
            }),

        getHistory: (limit: number = 50) =>
            this.request<{ count: number; history: any[] }>(`/follow-ups/history?limit=${limit}`)
    };

    locations = {
        getMe: () => this.request<any>('/locations/me')
    };

    // --- Map Data ---
    map = {
        getDrivers: (params: { min_lat: number; max_lat: number; min_lng: number; max_lng: number; status_filter?: string }) => {
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
        },

        getGlobalStats: () => this.request<any>('/map/stats/global'),

        getWeather: (params: { latitude: number; longitude: number }) => {
            const query = new URLSearchParams(params as any).toString();
            return this.request<{
                available: boolean;
                temperature_f?: number;
                temperature_c?: number;
                condition?: string;
                emoji?: string;
                location?: string;
                city?: string;
                state?: string;
                message?: string;
            }>(`/map/weather?${query}`);
        }
    };

    // --- Professional Profile ---
    profile = {
        create: (data: any) =>
            this.request<any>('/professional/profile', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        getMe: () => this.request<any>('/professional/profile/me'),

        updateMe: (data: any) =>
            this.request<any>('/professional/profile/me', {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),

        getPublic: (driverId: string) =>
            this.request<any>(`/professional/profile/${driverId}`),

        getOpenToWork: (limit = 20, offset = 0) =>
            this.request<any>(`/professional/profiles/open-to-work?limit=${limit}&offset=${offset}`),

        uploadPhoto: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return this.request<any>('/professional/profile/me/photo', {
                method: 'POST',
                body: formData,
            });
        },

        searchFMCSA: (query: string, type: 'dot' | 'name' = 'name') =>
            this.request<{ results: any[]; count: number }>(`/professional/fmcsa/search?q=${encodeURIComponent(query)}&type=${type}`),
    };

    // --- Jobs ---
    jobs = {
        create: (data: {
            title: string;
            company_name: string;
            description?: string;
            how_to_apply: string;
            mc_number?: string;
            dot_number?: string;
            haul_type: string;
            equipment: string;
            pay_info?: string;
            requirements: string[];
            regions: string[];
        }) =>
            this.request<any>('/jobs', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        list: (params?: {
            haul_type?: string;
            equipment?: string;
            region?: string;
            requirement?: string;
            search?: string;
            fmcsa_verified?: boolean;
            limit?: number;
            offset?: number;
        }) => {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        query.set(key, String(val));
                    }
                });
            }
            return this.request<{
                jobs: any[];
                total: number;
                limit: number;
                offset: number;
            }>(`/jobs?${query.toString()}`);
        },

        get: (id: string) => this.request<any>(`/jobs/${id}`),

        update: (id: string, data: Record<string, any>) =>
            this.request<any>(`/jobs/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),

        deactivate: (id: string) =>
            this.request<{ success: boolean; message: string }>(`/jobs/${id}`, {
                method: 'DELETE',
            }),

        listMine: (params?: { include_inactive?: boolean; limit?: number; offset?: number }) => {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        query.set(key, String(val));
                    }
                });
            }
            return this.request<{
                jobs: any[];
                total: number;
                limit: number;
                offset: number;
            }>(`/jobs/me?${query.toString()}`);
        },

        getMatches: (params?: { limit?: number; offset?: number }) => {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        query.set(key, String(val));
                    }
                });
            }
            return this.request<{
                matches: Array<{
                    job: any;
                    match_score: number;
                    match_reasons: string[];
                }>;
                total: number;
                limit: number;
                offset: number;
            }>(`/jobs/matches?${query.toString()}`);
        },

        getSeekers: (params?: {
            cdl_class?: string;
            equipment?: string;
            region?: string;
            limit?: number;
            offset?: number;
        }) => {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        query.set(key, String(val));
                    }
                });
            }
            return this.request<any[]>(`/drivers/seekers?${query.toString()}`);
        },
    };

    // --- Integrations (FMCSA/Google verification, role details) ---
    integrations = {
        searchGooglePlaces: (query: string, location?: string) =>
            this.request<{ results: any[]; count: number }>('/integrations/google-places/search', {
                method: 'POST',
                body: JSON.stringify({ query, location }),
            }),

        confirmGooglePlace: (google_data: Record<string, any>) =>
            this.request<{ success: boolean; message: string; profile: any }>('/integrations/google-places/confirm', {
                method: 'POST',
                body: JSON.stringify({ google_data }),
            }),

        confirmFMCSA: (fmcsa_data: Record<string, any>) =>
            this.request<{ success: boolean; message: string; profile: any }>('/integrations/fmcsa/confirm', {
                method: 'POST',
                body: JSON.stringify({ fmcsa_data }),
            }),

        updateRoleDetails: (role_details: Record<string, any>) =>
            this.request<{ success: boolean; message: string; profile: any }>('/integrations/role-details', {
                method: 'PATCH',
                body: JSON.stringify({ role_details }),
            }),
    };

    // --- Reviews ---
    reviews = {
        searchFacilities: (params: { q?: string; type?: string; lat?: number; lng?: number; limit?: number }) => {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    query.set(key, String(val));
                }
            });
            return this.request<{ facilities: any[]; total: number }>(`/reviews/facilities/search?${query.toString()}`);
        },

        getFacility: (id: string) =>
            this.request<{ facility: any; reviews: any[]; my_review: any | null }>(`/reviews/facilities/${id}`),

        getNearby: (params: { lat: number; lng: number; radius?: number; type?: string; limit?: number; offset?: number }) => {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    query.set(key, String(val));
                }
            });
            return this.request<{ facilities: any[]; total: number; limit: number; offset: number }>(`/reviews/facilities/nearby?${query.toString()}`);
        },

        getTopRated: (params?: { type?: string; limit?: number; offset?: number }) => {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        query.set(key, String(val));
                    }
                });
            }
            return this.request<{ facilities: any[]; total: number; limit: number; offset: number }>(`/reviews/facilities/top-rated?${query.toString()}`);
        },

        addFacility: (data: {
            name: string;
            facility_type: string;
            address?: string;
            city?: string;
            state?: string;
            zip_code?: string;
            latitude?: number;
            longitude?: number;
            phone?: string;
            website?: string;
            google_place_id?: string;
            google_data?: any;
            google_rating?: number;
            google_review_count?: number;
            auto_detected_type?: string;
            reviewer_latitude?: number;
            reviewer_longitude?: number;
        }) =>
            this.request<any>('/reviews/facilities', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        submitReview: (facilityId: string, data: {
            overall_rating: number;
            category_ratings?: Record<string, number>;
            comment?: string;
            visit_date?: string;
            would_return?: boolean;
            visit_count?: string;
            confirm_type?: string;
        }) =>
            this.request<any>(`/reviews/facilities/${facilityId}/reviews`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        updateReview: (facilityId: string, data: {
            overall_rating?: number;
            category_ratings?: Record<string, number>;
            comment?: string;
            visit_date?: string;
            would_return?: boolean;
            visit_count?: string;
        }) =>
            this.request<any>(`/reviews/facilities/${facilityId}/reviews/mine`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),

        deleteReview: (facilityId: string) =>
            this.request<{ success: boolean; message: string }>(`/reviews/facilities/${facilityId}/reviews/mine`, {
                method: 'DELETE',
            }),

        flagType: (facilityId: string) =>
            this.request<{ success: boolean; message: string; correction_count: number }>(`/reviews/facilities/${facilityId}/flag-type`, {
                method: 'POST',
            }),

        getMyReviews: () =>
            this.request<{ reviews: any[]; total: number }>('/reviews/me'),

        getCategories: (facilityType: string) =>
            this.request<Array<{ key: string; label: string }>>(`/reviews/categories/${facilityType}`),
    };
}

export const api = new ApiClient();
