import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { setAuthToken } from '../services/storage';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
    id: string;
    email: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ error?: string }>;
    register: (email: string, password: string) => Promise<{ error?: string; confirmEmail?: boolean }>;
    resetPassword: (email: string) => Promise<{ error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(su: SupabaseUser | null | undefined): User | null {
    if (!su) return null;
    return { id: su.id, email: su.email ?? '' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(mapUser(session?.user));
            const t = session?.access_token ?? null;
            setToken(t);
            setAuthToken(t);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(mapUser(session?.user));
                const t = session?.access_token ?? null;
                setToken(t);
                setAuthToken(t);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ error?: string }> => {
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });
        if (error) return { error: error.message };
        return {};
    };

    const register = async (email: string, password: string): Promise<{ error?: string; confirmEmail?: boolean }> => {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                emailRedirectTo: 'https://chat-murex-eta.vercel.app',
            },
        });
        if (error) return { error: error.message };
        // If user needs email confirmation (identities array is empty)
        const needsConfirm = data.user && (!data.user.identities || data.user.identities.length === 0 || !data.session);
        return { confirmEmail: !!needsConfirm };
    };

    const resetPassword = async (email: string): Promise<{ error?: string }> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: 'https://chat-murex-eta.vercel.app',
        });
        if (error) return { error: error.message };
        return {};
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setToken(null);
        setAuthToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
