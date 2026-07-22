import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

export default function TopBar() {
    return (
        <header className="topbar">
            <div className="container topbar-inner">
                <Link to="/" className="brand">
                    <span className="brand-dot"><CalendarCheck size={17} /></span>
                    Agenda Pro
                </Link>
                <nav>
                    <Link to="/admin" className="nav-link">Área Administrativa</Link>
                </nav>
            </div>
        </header>
    );
}
