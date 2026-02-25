import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: number;
    email: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (!storedToken) {
            setIsLoading(false);
            return;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Validate token with server
        fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
            signal: controller.signal
        })
            .then(r => {
                clearTimeout(timeoutId);
                return r.ok ? r.json() : null;
            })
            .then(data => {
                if (data?.user) {
                    setToken(storedToken);
                    setUser(data.user);
                } else {
                    localStorage.removeItem('auth_token');
                }
            })
            .catch((e) => {
                console.error('Auth /me error:', e);
                localStorage.removeItem('auth_token');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
