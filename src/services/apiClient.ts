import { getCurrentSession } from './cognitoService';

const LEGACY_API_BASE_URL = 'https://ady0805oe7.execute-api.ap-southeast-1.amazonaws.com/prod';
const CURRENT_API_BASE_URL = 'https://agmdqgycme.execute-api.ap-southeast-1.amazonaws.com/prod';
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = !configuredApiBaseUrl || configuredApiBaseUrl === LEGACY_API_BASE_URL
    ? CURRENT_API_BASE_URL
    : configuredApiBaseUrl;

interface ApiEnvelope<T> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
}

interface ApiError extends Error {
    statusCode?: number;
    details?: any;
}

export class NetworkError extends Error implements ApiError {
    statusCode?: number;
    details?: any;

    constructor(message: string, statusCode?: number, details?: any) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
        this.details = details;
    }
}

export async function apiRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    skipAuth: boolean = false
): Promise<T> {
    try {
        // Get authentication token
        const session = !skipAuth ? await getCurrentSession() : null;
        const token = session?.idToken;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method,
            headers,
            mode: 'cors',
            credentials: 'omit',
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`[API] ${method} ${url}`, body ? { body } : '');

        const response = await fetch(url, config);

        // Handle different response statuses
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorDetails = null;

            try {
                const errorData = await response.json();
                errorMessage = errorData?.message || errorData?.error || errorMessage;
                errorDetails = errorData;
            } catch {
                // If JSON parsing fails, use status text
            }

            console.error(`[API Error] ${method} ${url}:`, {
                status: response.status,
                message: errorMessage,
                details: errorDetails,
            });

            throw new NetworkError(errorMessage, response.status, errorDetails);
        }

        // Return empty object for 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        const payload = await response.json();
        console.log(`[API Response] ${method} ${url}:`, payload);

        // Handle envelope pattern
        if (payload && typeof payload === 'object' && ('success' in payload || 'data' in payload || 'error' in payload)) {
            const envelope = payload as ApiEnvelope<T>;
            if (envelope.success === false) {
                throw new NetworkError(
                    envelope.error || envelope.message || 'API Error',
                    response.status,
                    envelope
                );
            }
            return (envelope.data ?? payload) as T;
        }

        return payload as T;
    } catch (error) {
        if (error instanceof NetworkError) {
            throw error;
        }

        // Handle network failures (CORS, timeout, etc.)
        console.error(`[Network Failure] ${method} ${endpoint}:`, error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new NetworkError(
                'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API.',
                0,
                { originalError: error.message }
            );
        }

        throw error;
    }
}
