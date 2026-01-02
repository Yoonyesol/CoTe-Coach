import { Session, User, AuthError } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    signIn: (email: string) => Promise<{ error: AuthError | null }>;
    signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    initialize: () => Promise<void>;
    verifyCurrentPassword: (password: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}
