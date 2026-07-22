import React, { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, Check, Clock, Sparkles, Phone } from 'lucide-react';
import TopBar from '@/components/TopBar';
import {
    SERVICES,
    TIME_SLOTS,
    getBookedTimes,
    createAppointment,
} from '@/services/appointmentsService';

const HERO_IMG = 'https://images.hostinger.com/37ca1f5b-9bc1-4750-a470-bbdeaab84d63.png';

function todayStr() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

export default function HomePage() {
    const [form, setForm] = useState({
        name: '', phone: '', service: SERVICES[0], date: todayStr(), time: '',
    });
    const [booked, setBooked] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [confirmed, setConfirmed] = useState(null);
    const [apiError, setApiError] = useState('');

    const loadSlots = useCallback(async (date) => {
        if (!date) return;
        setLoadingSlots(true);
        try {
            const times = await getBookedTimes(date);
            setBooked(times);
        } catch {
            setBooked([]);
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    useEffect(() => { loadSlots(form.date); }, [form.date, loadSlots]);

    const update = (key, value) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
        if (key === 'time') setApiError('');
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Informe seu nome completo.';
        if (!/^[\d\s()+-]{8,}$/.test(form.phone.trim())) e.phone = 'Informe um telefone válido.';
        if (!form.service) e.service = 'Selecione um serviço.';
        if (!form.date) e.date = 'Selecione uma data.';
        if (!form.time) e.time = 'Selecione um horário disponível.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        setApiError('');
        if (!validate()) return;
        setSubmitting(true);
        try {
            await createAppointment({
                name: form.name.trim(),
                phone: form.phone.trim(),
                service: form.service,
                date: form.date,
                time: form.time,
            });
            setConfirmed({ ...form });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            if (err?.status === 400) {
                setApiError('Este horário acabou de ser reservado. Escolha outro.');
                loadSlots(form.date);
                update('time', '');
            } else {
                setApiError('Não foi possível concluir o agendamento. Tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setConfirmed(null);
        setForm({ name: '', phone: '', service: SERVICES[0], date: todayStr(), time: '' });
        loadSlots(todayStr());
    };

    return (
        <div>
            <TopBar />

            {confirmed ? (
                <section className="section">
                    <div className="container" style={{ maxWidth: 560 }}>
                        <div className="card confirm">
                            <div className="confirm-badge"><Check size={30} /></div>
                            <h2>Agendamento confirmado!</h2>
                            <p style={{ color: 'var(--muted)', margin: 0 }}>
                                Olá {confirmed.name.split(' ')[0]}, seu horário está reservado.
                                Nossa equipe entrará em contato pelo telefone informado.
                            </p>
                            <div className="confirm-detail">
                                <div className="row"><span>Serviço</span><b>{confirmed.service}</b></div>
                                <div className="row"><span>Data</span><b>{formatDate(confirmed.date)}</b></div>
                                <div className="row"><span>Horário</span><b>{confirmed.time}</b></div>
                                <div className="row"><span>Cliente</span><b>{confirmed.name}</b></div>
                                <div className="row"><span>Telefone</span><b>{confirmed.phone}</b></div>
                                <div className="row"><span>Status</span><b><span className="badge agendado">Agendado</span></b></div>
                            </div>
                            <button className="btn btn-primary" onClick={resetForm}>
                                Fazer novo agendamento
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                <>
                    <section className="hero">
                        <div className="container hero-grid">
                            <div>
                                <span className="eyebrow"><Sparkles size={13} /> Plataforma de agendamento para empresas</span>
                                <h1>Agende os serviços da sua empresa de forma <em>simples, rápida</em> e organizada.</h1>
                                <p className="lead">
                                    Uma solução completa de agendamento para qualquer tipo de negócio.
                                    Gerencie horários, consulte disponibilidade e acompanhe seus
                                    atendimentos em tempo real.
                                </p>
                                <a href="#agendar" className="btn btn-primary">
                                    <CalendarCheck size={18} /> Agendar Serviço
                                </a>
                                <div className="stats" style={{ marginTop: 32 }}>
                                    <div className="stat"><b>10+</b><span>horários por dia</span></div>
                                    <div className="stat"><b>9</b><span>serviços</span></div>
                                    <div className="stat"><b>100%</b><span>online</span></div>
                                </div>
                            </div>
                            <div className="hero-media">
                                <img src={HERO_IMG} alt="Profissionais em reunião de negócios em escritório corporativo moderno" />
                            </div>
                        </div>
                    </section>

                    <section className="section" id="agendar">
                        <div className="container">
                            <h2 className="section-title">Faça seu agendamento</h2>
                            <p className="section-sub">Preencha seus dados e escolha um horário livre.</p>

                            <div className="chips">
                                {SERVICES.map((s) => <span className="chip" key={s}>{s}</span>)}
                            </div>

                            <form className="card card-pad" style={{ marginTop: 22 }} onSubmit={submit} noValidate>
                                {apiError && <div className="alert error">{apiError}</div>}
                                <div className="form-grid">
                                    <div className="field">
                                        <label>Nome completo</label>
                                        <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ex: Maria Silva" />
                                        {errors.name && <span className="err">{errors.name}</span>}
                                    </div>
                                    <div className="field">
                                        <label>Telefone</label>
                                        <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(11) 99999-9999" />
                                        {errors.phone && <span className="err">{errors.phone}</span>}
                                    </div>
                                    <div className="field">
                                        <label>Serviço</label>
                                        <select value={form.service} onChange={(e) => update('service', e.target.value)}>
                                            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {errors.service && <span className="err">{errors.service}</span>}
                                    </div>
                                    <div className="field">
                                        <label>Data</label>
                                        <input type="date" min={todayStr()} value={form.date} onChange={(e) => update('date', e.target.value)} />
                                        {errors.date && <span className="err">{errors.date}</span>}
                                    </div>
                                    <div className="field full">
                                        <label><Clock size={13} style={{ verticalAlign: '-2px' }} /> Horários disponíveis</label>
                                        {loadingSlots ? (
                                            <p className="hint">Carregando horários…</p>
                                        ) : (
                                            <div className="slots">
                                                {TIME_SLOTS.map((t) => {
                                                    const taken = booked.includes(t);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={t}
                                                            className={`slot ${form.time === t ? 'active' : ''}`}
                                                            disabled={taken}
                                                            onClick={() => update('time', t)}
                                                        >
                                                            {t}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <p className="hint">Horários riscados já estão ocupados.</p>
                                        {errors.time && <span className="err">{errors.time}</span>}
                                    </div>
                                    <div className="field full">
                                        <button className="btn btn-primary btn-block" disabled={submitting}>
                                            {submitting ? 'Confirmando…' : 'Confirmar agendamento'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </section>
                </>
            )}

            <footer className="footer">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 10 }}>
                    <span>© {new Date().getFullYear()} Agenda Pro — Todos os direitos reservados.</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} /> (11) 4000-0000
                    </span>
                </div>
            </footer>
        </div>
    );
}

export function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}
