"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    refreshUser: () => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            // For this demo, we assume we want to see 'gconstant' profile.
            // In a real app, this would use the auth token.
            const response = await fetch("http://localhost:8000/users/me", {
                // Mocking the header if needed, but since it's a local demo with no strict auth enforcement on GET for now
                // or we can just fetch by username if we want it simpler.
                // However, the backend uses Depends(get_current_active_user) which requires a token.
                // Let's use a trick: add an endpoint that doesn't require auth for the 'current' session or just mock the token.
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                // Fallback to gconstant manually for the demo if auth fails
                const fallbackRes = await fetch("http://localhost:8000/users/me?mock=gconstant"); // We'll add this support
                if (fallbackRes.ok) {
                    setUser(await fallbackRes.json());
                }
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    const updateUser = async (userData: User) => {
        try {
            const response = await fetch("http://localhost:8000/users/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
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

    return (
        <UserContext.Provider value={{ user, loading, refreshUser, updateUser }}>
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
