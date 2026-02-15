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

        if (error) {
            return { error };
        }

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('deleted_at')
                .eq('id', data.user.id)
                .single();

            // If query fails (including 406), we err on the side of caution and block
            if (profileError || profile?.deleted_at) {
                await supabase.auth.signOut();
                set({ session: null, user: null });
                return { error: { message: '존재하지 않는 계정입니다.' } as any };
            }
        } catch (err) {
            await supabase.auth.signOut();
            set({ session: null, user: null });
            return { error: { message: '인증 확인 중 오류가 발생했습니다.' } as any };
        }
        set({ session: data.session, user: data.user });
        return { error: null };
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
        const { initialized } = (useAuthStore.getState() as any);
        if (initialized) return;

        try {
            // Register session change listener
            supabase.auth.onAuthStateChange(async (event, session) => {
                // We only handle INITIAL_SESSION and auto-refreshes here.
                // SIGNED_IN is handled explicitly in signInWithPassword to provide better errors.
                if (session?.user && (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('deleted_at')
                        .eq('id', session.user.id)
                        .single();

                    if (profile?.deleted_at) {
                        await supabase.auth.signOut();
                        set({ session: null, user: null, isLoading: false, initialized: true });
                        return;
                    }
                }

                if (event === 'SIGNED_OUT' || (event as string) === 'TOKEN_REFRESH_REVOKED') {
                    set({ session: null, user: null, isLoading: false, initialized: true });
                } else {
                    // We handle INITIAL_SESSION, TOKEN_REFRESHED, and SIGNED_IN here.
                    // Even if SIGNED_IN is handled in signInWithPassword, updating here 
                    // ensures consistency if session recovery triggers a SIGNED_IN event.
                    set({ session, user: session?.user ?? null, isLoading: false, initialized: true });
                }
            });

            // Register window focus/visibility listener for session recovery
            const handleVisibilityChange = async () => {
                if (document.visibilityState === 'visible') {
                    // Non-blocking background check
                    supabase.auth.getSession().then(({ data: { session: refreshedSession } }) => {
                        set({ session: refreshedSession, user: refreshedSession?.user ?? null });
                    });
                }
            };
            window.addEventListener('visibilitychange', handleVisibilityChange);

            // Initial check with Safety Timeout
            console.log('[Auth] ✅ 세션 확인 시작 (timeout: 4s)');
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 4000)
            );

            try {
                const { data: { session } } = await Promise.race([
                    supabase.auth.getSession(),
                    timeoutPromise
                ]) as any;

                // 1. Unblock UI immediately with session info
                console.log('[Auth] ✅ 세션 확인 완료:', { hasSession: !!session, userId: session?.user?.id });
                set({ session, user: session?.user ?? null, isLoading: false, initialized: true });

                // 2. Background Security Check (Non-blocking)
                if (session?.user) {
                    supabase
                        .from('profiles')
                        .select('deleted_at')
                        .eq('id', session.user.id)
                        .single()
                        .then(({ data: profile }) => {
                            if (profile?.deleted_at) {
                                supabase.auth.signOut();
                                set({ session: null, user: null });
                                console.warn('[Auth] Redirecting deleted account to login');
                            }
                        });
                }
            } catch (error) {
                console.warn('[Auth] ❌ 초기화 실패 또는 타임아웃:', error);
                // Fallback to null session to unblock UI
                set({ session: null, user: null, isLoading: false, initialized: true });
            }
        } catch (error) {
            console.error('[Auth] Initialization fatal error:', error);
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
    },
    deleteAccount: async (reason: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: '로그인 정보를 찾을 수 없습니다.' } };

        // 1. Update profile with soft delete info
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                deleted_at: new Date().toISOString(),
                deletion_reason: reason
            })
            .eq('id', user.id);

        if (profileError) return { error: profileError };

        // 2. Sign out
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) return { error: signOutError };

        set({ session: null, user: null });
        return { error: null };
    }
}));
