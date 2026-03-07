import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconLogo, IconEye, IconEyeOff } from '../components/Icons';

export default function AuthPage() {
    const { login, register } = useAuth();
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
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
                return;
            }

            const result = await login(email, password);
            if (result.error) {
                setError(result.error);
            }
        } catch {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <IconLogo size={32} className="logo-svg" />
                    <span className="auth-logo-text">Спроси ИИ</span>
                </div>

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
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {successMessage && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', fontSize: '13px', marginBottom: '12px' }}>{successMessage}</div>}

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
                    </button>
                </form>
            </div>
        </div>
    );
}
