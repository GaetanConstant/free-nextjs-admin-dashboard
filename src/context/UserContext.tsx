"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE_URL } from "@/utils/api";

interface User {
    username: string;
    email: string;
    full_name: string;
    role: string;
    avatar_url?: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const getAuthHeader = (): HeadersInit => {
        if (typeof document === "undefined") return {};
        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
        return token ? { "Authorization": `Bearer ${token}` } : {};
    };

    const fetchUser = async () => {
        try {
            if (typeof document === "undefined") return;
            const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const expires = new Date();
                expires.setDate(expires.getDate() + 7);
                document.cookie = `auth_token=${data.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
                await fetchUser();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error", error);
            return false;
        }
    };

    const logout = () => {
        if (typeof document !== "undefined") {
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        setUser(null);
        window.location.href = "/signin";
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    const updateUser = async (userData: User) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: "PUT",
                headers: {
                    ...getAuthHeader(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData),
            });
            if (response.ok) {
                setUser(userData);
            }
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const changePassword = async (oldPassword: string, newPassword: string) => {
        const authHeader = getAuthHeader() as { Authorization?: string };
        const token = authHeader.Authorization;
        if (!token) return { success: false, message: "Non authentifié" };

        try {
            const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.detail || "Erreur lors du changement de mot de passe" };
            }
        } catch (error: any) {
            return { success: false, message: "Une erreur est survenue" };
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout, refreshUser, updateUser, changePassword }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
