import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconLogo, IconEye, IconEyeOff, IconClose } from './Icons';

interface AuthModalProps {
    onClose: () => void;
    title?: string;
}

export default function AuthModal({ onClose, title = "Необходима авторизация" }: AuthModalProps) {
    const { login, register, resetPassword } = useAuth();
    const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (tab === 'forgot') {
                const result = await resetPassword(email);
                if (result.error) {
                    setError(result.error);
                    return;
                }
                setSuccessMessage('Инструкции по восстановлению отправлены на ' + email);
                return;
            }

            if (tab === 'register') {
                const result = await register(email, password);
                if (result.error) {
                    setError(result.error);
                    return;
                }
                if (result.confirmEmail) {
                    setSuccessMessage('Проверьте почту — мы отправили ссылку для подтверждения на ' + email);
                    return;
                }
                onClose();
                return;
            }

            // login
            const result = await login(email, password);
            if (result.error) {
                setError(result.error);
                return;
            }
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
                            autoComplete="email"
                        />
                    </div>

                    {tab !== 'forgot' && (
                        <div className="auth-field">
                            <label>Пароль</label>
                            <div className="auth-password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={tab === 'register' ? 'Минимум 6 символов' : 'Введите пароль'}
                                    required
                                    autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
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
                            {tab === 'login' && (
                                <div style={{ textAlign: 'right', marginTop: '4px' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setTab('forgot'); setError(''); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        Забыли пароль?
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {error && <div className="auth-error">{error}</div>}
                    {successMessage && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', fontSize: '13px', marginBottom: '12px' }}>{successMessage}</div>}

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : tab === 'register' ? 'Создать аккаунт' : 'Отправить'}
                    </button>

                    {tab === 'forgot' && (
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={() => { setTab('login'); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}
                            >
                                Вернуться ко входу
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
