import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Trash2, Ban, Filter, RefreshCw, CalendarDays } from 'lucide-react';
import {
    getAllAppointments,
    updateStatus,
    deleteAppointment,
    adminLogout,
    isAdminAuthed,
    STATUS_LABELS,
} from '@/services/appointmentsService';
import { formatDate } from '@/pages/HomePage';

const STATUSES = ['agendado', 'confirmado', 'concluido', 'cancelado'];

export default function AdminPage() {
    const nav = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAdminAuthed()) nav('/admin/login');
    }, [nav]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllAppointments(filterDate || undefined);
            setItems(data);
        } catch {
            setError('Erro ao carregar os agendamentos.');
        } finally {
            setLoading(false);
        }
    }, [filterDate]);

    useEffect(() => { load(); }, [load]);

    const onStatusChange = async (id, status) => {
        try {
            await updateStatus(id, status);
            setItems((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
        } catch {
            setError('Não foi possível atualizar o status.');
        }
    };

    const onCancel = async (id) => {
        if (!window.confirm('Cancelar este agendamento?')) return;
        await onStatusChange(id, 'cancelado');
    };

    const onDelete = async (id) => {
        if (!window.confirm('Excluir permanentemente este agendamento?')) return;
        try {
            await deleteAppointment(id);
            setItems((list) => list.filter((i) => i.id !== id));
        } catch {
            setError('Não foi possível excluir o agendamento.');
        }
    };

    const logout = () => {
        adminLogout();
        nav('/admin/login');
    };

    const counts = STATUSES.reduce((acc, s) => {
        acc[s] = items.filter((i) => i.status === s).length;
        return acc;
    }, {});

    return (
        <div className="admin-shell">
            <header className="topbar">
                <div className="container topbar-inner">
                    <Link to="/" className="brand">
                        <span className="brand-dot"><CalendarDays size={17} /></span>
                        Agenda Pro · Admin
                    </Link>
                    <button className="btn btn-ghost btn-sm" onClick={logout}>
                        <LogOut size={15} /> Sair
                    </button>
                </div>
            </header>

            <div className="container section">
                <div className="admin-head">
                    <div>
                        <h1 className="section-title" style={{ margin: 0 }}>Agendamentos</h1>
                        <p className="section-sub" style={{ margin: '4px 0 0' }}>
                            Gerencie os atendimentos e o status de cada cliente.
                        </p>
                    </div>
                </div>

                <div className="stat-cards">
                    <div className="stat-card"><b>{items.length}</b><span>Total exibido</span></div>
                    <div className="stat-card"><b>{counts.agendado + counts.confirmado}</b><span>Ativos</span></div>
                    <div className="stat-card"><b>{counts.concluido}</b><span>Concluídos</span></div>
                    <div className="stat-card"><b>{counts.cancelado}</b><span>Cancelados</span></div>
                </div>

                <div className="toolbar">
                    <div className="field">
                        <label><Filter size={13} style={{ verticalAlign: '-2px' }} /> Filtrar por data</label>
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    {filterDate && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setFilterDate('')}>Limpar filtro</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={load}>
                        <RefreshCw size={14} /> Atualizar
                    </button>
                </div>

                {error && <div className="alert error">{error}</div>}

                {loading ? (
                    <div className="spinner-wrap">Carregando agendamentos…</div>
                ) : items.length === 0 ? (
                    <div className="empty">Nenhum agendamento encontrado{filterDate ? ' para esta data' : ''}.</div>
                ) : (
                    <div className="table-wrap card">
                        <table className="appts">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Telefone</th>
                                    <th>Serviço</th>
                                    <th>Data</th>
                                    <th>Hora</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((a) => (
                                    <tr key={a.id}>
                                        <td><b>{a.name}</b></td>
                                        <td>{a.phone}</td>
                                        <td>{a.service}</td>
                                        <td>{formatDate(a.date)}</td>
                                        <td>{a.time}</td>
                                        <td>
                                            <span className={`badge ${a.status}`}>{STATUS_LABELS[a.status]}</span>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                <select
                                                    className="status-select"
                                                    value={a.status}
                                                    onChange={(e) => onStatusChange(a.id, e.target.value)}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                                    ))}
                                                </select>
                                                {a.status !== 'cancelado' && (
                                                    <button className="btn btn-ghost btn-sm" title="Cancelar" onClick={() => onCancel(a.id)}>
                                                        <Ban size={14} />
                                                    </button>
                                                )}
                                                <button className="btn btn-danger btn-sm" title="Excluir" onClick={() => onDelete(a.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
