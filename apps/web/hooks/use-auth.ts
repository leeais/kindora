import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { User } from '@/types/models/user.type';

interface AuthState {
  loading: boolean;
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setCredentials: (user: User, accessToken: string) => void;
  clearAuthState: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      loading: true,
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setCredentials: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),
      clearAuthState: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setLoading(false);
        };
      },
    },
  ),
);
