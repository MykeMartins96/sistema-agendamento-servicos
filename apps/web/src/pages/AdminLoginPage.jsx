import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { adminLogin } from '@/services/appointmentsService';

export default function AdminLoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await adminLogin(email.trim(), password);
            nav('/admin');
        } catch {
            setError('E-mail ou senha inválidos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-shell login-wrap">
            <div className="login-card card card-pad">
                <div className="confirm-badge" style={{ width: 56, height: 56, marginBottom: 14 }}>
                    <Lock size={24} />
                </div>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, margin: '0 0 4px', color: 'var(--accent-dark)' }}>Área Administrativa</h2>
                <p style={{ color: 'var(--muted)', marginTop: 0, fontSize: '0.9rem' }}>
                    Entre para gerenciar os agendamentos.
                </p>
                <form onSubmit={submit} style={{ marginTop: 18 }} noValidate>
                    {error && <div className="alert error">{error}</div>}
                    <div className="field" style={{ marginBottom: 14 }}>
                        <label>E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@empresa.com" />
                    </div>
                    <div className="field" style={{ marginBottom: 18 }}>
                        <label>Senha</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <button className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>
                <Link to="/" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: 0 }}>
                    <ArrowLeft size={14} /> Voltar ao site
                </Link>
            </div>
        </div>
    );
}
