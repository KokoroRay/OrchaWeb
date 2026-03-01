import { getCurrentSession } from './cognitoService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ady0805oe7.execute-api.ap-southeast-1.amazonaws.com/default';

interface ApiEnvelope<T> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export async function apiRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
): Promise<T> {
    const session = await getCurrentSession();
    const token = session?.idToken;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `API Error: ${response.statusText}`);
        }

        // Return empty object for 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        const payload = await response.json();

        if (payload && typeof payload === 'object' && ('success' in payload || 'data' in payload || 'error' in payload)) {
            const envelope = payload as ApiEnvelope<T>;
            if (envelope.success === false) {
                throw new Error(envelope.error || envelope.message || 'API Error');
            }
            return (envelope.data ?? ({} as T)) as T;
        }

        return payload as T;
    } catch (error) {
        console.error(`API Request failed for ${endpoint}:`, error);
        throw error;
    }
}
