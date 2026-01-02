import { create } from 'zustand';
import { supabase } from '../lib/supabase';

import { AuthState } from '../types/auth';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    initialized: false,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user ?? null }),

    signIn: async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error };
    },

    signInWithPassword: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.session) {
            set({ session: data.session, user: data.user });
        }
        return { error };
    },

    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        if (!error && data.session) {
            set({ session: data.session, user: data.user });
        }
        return { error };
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        set({ user: null, session: null });
        return { error };
    },

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({ session, user: session?.user ?? null, isLoading: false, initialized: true });

            // 세션 변화 감지 리스너 등록
            supabase.auth.onAuthStateChange((_event, session) => {
                set({ session, user: session?.user ?? null, isLoading: false });
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false, initialized: true });
        }
    },

    verifyCurrentPassword: async (password: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
            return { error: { message: '로그인 정보를 찾을 수 없습니다.' } as any };
        }
        const { error } = await supabase.auth.signInWithPassword({
            email: user.email,
            password
        });
        return { error };
    },

    updatePassword: async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error };
    }
}));
