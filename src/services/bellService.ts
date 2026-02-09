export interface BellConfig {
    bellDurationSec: number;
    activeDays: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    shift1: {
        start: string; // "HH:mm"
        end: string;   // "HH:mm"
        times: string[]; // ["HH:mm", ...]
    };
    shift2: {
        start: string;
        end: string;
        times: string[];
    };
    customTimes: string[];
    holidays: string[]; // "YYYY-MM-DD"
}

export interface TimeStatus {
    ok: boolean;
    local: string;
    tzOffsetMinutes: number;
}

class BellService {
    private baseUrl: string = 'http://192.168.4.1'; // Default AP IP

    setBaseUrl(url: string) {
        // Remove trailing slash
        this.baseUrl = url.replace(/\/$/, '');
    }

    getBaseUrl() {
        return this.baseUrl;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        try {
            // Set a timeout for the request
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(id);

            if (!res.ok) {
                throw new Error(`Request failed: ${res.status} ${res.statusText}`);
            }

            // Handle text/plain responses vs json
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return res.json();
            }
            return res.text() as unknown as T;
        } catch (error) {
            console.error(`BellService Error (${endpoint}):`, error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error("Qurilma bilan aloqa yo'q (Network/CORS). IP manzilni tekshiring yoki qurilma o'chig'ligini ko'ring.");
            }
            throw error;
        }
    }

    async getConfig(): Promise<BellConfig> {
        return this.request<BellConfig>('/api/config');
    }

    async saveConfig(config: BellConfig): Promise<void> {
        await this.request('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
    }

    async getTime(): Promise<TimeStatus> {
        return this.request<TimeStatus>('/api/time');
    }

    async syncTime(): Promise<void> {
        const epoch = Math.floor(Date.now() / 1000);
        const tzOffsetMinutes = -new Date().getTimezoneOffset();
        await this.request('/api/time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ epoch, tzOffsetMinutes }),
        });
    }

    async testBell(durationSec: number = 5): Promise<void> {
        await this.request('/api/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration: durationSec })
        });
    }
}

export const bellService = new BellService();
