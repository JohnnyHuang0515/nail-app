// Authentication service for LIFF / LINE Login
// Manages user auth state in the client app

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    name: string;
    phone?: string;
    gender?: 'female' | 'male' | 'other';
    birthday?: string;
    avatarUrl?: string;
    lineUserId?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isProfileComplete: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
    checkProfileComplete: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isLoading: false,
            isProfileComplete: false,

            setUser: (user) => {
                const isComplete = user
                    ? !!(user.phone && user.gender && user.birthday)
                    : false;
                set({ user, isProfileComplete: isComplete });
            },

            setAccessToken: (token) => set({ accessToken: token }),

            setLoading: (loading) => set({ isLoading: loading }),

            logout: () => set({
                user: null,
                accessToken: null,
                isProfileComplete: false
            }),

            checkProfileComplete: () => {
                const { user } = get();
                return !!(user?.phone && user?.gender && user?.birthday);
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);

// API functions
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function loginWithLine(accessToken: string): Promise<User | null> {
    try {
        const response = await fetch(`${API_URL}/auth/line-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();

        // Store tokens
        useAuthStore.getState().setAccessToken(data.accessToken);
        useAuthStore.getState().setUser(data.user);

        return data.user;
    } catch (error) {
        console.error('LINE login error:', error);
        return null;
    }
}

export async function updateUserProfile(
    userId: string,
    profile: Partial<User>
): Promise<User | null> {
    try {
        const { accessToken } = useAuthStore.getState();

        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error('Update failed');
        }

        const updated = await response.json();
        useAuthStore.getState().setUser(updated);

        return updated;
    } catch (error) {
        console.error('Update profile error:', error);
        return null;
    }
}
