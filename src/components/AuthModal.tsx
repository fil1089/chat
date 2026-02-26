import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconLogo, IconEye, IconEyeOff, IconClose } from './Icons';

interface AuthModalProps {
    onClose: () => void;
    title?: string;
}

export default function AuthModal({ onClose, title = "Необходима авторизация" }: AuthModalProps) {
    const { login } = useAuth();
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ошибка сервера');
                return;
            }

            login(data.token, data.user);
            onClose();
        } catch {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="no-api-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                <button
                    className="no-api-modal-close"
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <IconClose size={20} />
                </button>

                {/* Logo */}
                <div className="auth-logo" style={{ marginTop: '10px' }}>
                    <IconLogo size={32} className="logo-svg" />
                    <span className="auth-logo-text">Спроси ИИ</span>
                </div>

                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '18px' }}>
                    {title}
                </h3>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                        onClick={() => { setTab('login'); setError(''); }}
                    >
                        Войти
                    </button>
                    <button
                        className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
                        onClick={() => { setTab('register'); setError(''); }}
                    >
                        Регистрация
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label>Пароль</label>
                        <div className="auth-password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={tab === 'register' ? 'Минимум 6 символов' : 'Введите пароль'}
                                required
                            />
                            <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
                    </button>
                </form>
            </div>
        </div>
    );
}
