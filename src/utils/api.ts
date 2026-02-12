export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getAuthToken = () => {
    if (typeof document === "undefined") return null;
    return document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        ...options.headers,
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        // Optional: handle automatic logout or redirect if needed
        // But usually context handles this if it's wrapping the app
    }

    return response;
};
