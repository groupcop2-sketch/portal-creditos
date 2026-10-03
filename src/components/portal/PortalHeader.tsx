import React from 'react';
import type { PortalCliente } from '../../api';

interface PortalHeaderProps {
  cliente: PortalCliente | null;
  onOpenAuth: (mode?: 'login' | 'registro') => void;
  onOpenOnboarding: () => void;
  onLogout: () => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  activeView: 'landing' | 'dashboard';
  onNavigateView: (view: 'landing' | 'dashboard') => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  cliente,
  onOpenAuth,
  onOpenOnboarding,
  onLogout,
  themeMode,
  onToggleTheme,
  activeView,
  onNavigateView
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'CL';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getFirstName = (name?: string) => {
    if (!name) return 'Cliente';
    return name.trim().split(/\s+/)[0];
  };

  return (
    <header className="portal-header">
      <div className="portal-header-container">
        {/* Brand Logo */}
        <div className="portal-header-brand" onClick={() => onNavigateView('landing')}>
          <div className="portal-brand-icon">
            <span>CA</span>
          </div>
          <div className="portal-brand-text">
            <strong>CrediApp</strong>
            <span className="brand-tag">Portal Clientes</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="portal-header-nav">
          <button
            type="button"
            className={`nav-link-btn ${activeView === 'landing' ? 'active' : ''}`}
            onClick={() => onNavigateView('landing')}
          >
            Simulador
          </button>
          <a href="#como-funciona" className="nav-link-btn" onClick={() => onNavigateView('landing')}>
            ¿Cómo funciona?
          </a>
          <a href="#beneficios" className="nav-link-btn" onClick={() => onNavigateView('landing')}>
            Beneficios
          </a>
          <a href="#preguntas" className="nav-link-btn" onClick={() => onNavigateView('landing')}>
            Preguntas Frecuentes
          </a>
          {cliente && (
            <button
              type="button"
              className={`nav-link-btn highlight ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigateView('dashboard')}
            >
              📊 Mis Solicitudes
            </button>
          )}
        </nav>

        {/* Right Action Controls */}
        <div className="portal-header-actions">
          {/* Theme toggle */}
          <button
            type="button"
            className="portal-icon-btn"
            onClick={onToggleTheme}
            title={themeMode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {themeMode === 'light' ? '🌙' : '☀️'}
          </button>

          {cliente ? (
            <div className="portal-user-menu">
              <div
                className="portal-user-badge"
                onClick={() => onNavigateView('dashboard')}
                title={cliente.nombreCompleto}
              >
                <div className="user-avatar-circle">
                  {getInitials(cliente.nombreCompleto)}
                </div>
                <div className="user-badge-info">
                  <span className="user-name">Hola, {getFirstName(cliente.nombreCompleto)}</span>
                  <span className="user-company">{cliente.empresa || 'Cliente'}</span>
                </div>
              </div>
              <button
                type="button"
                className="portal-btn-ghost"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="portal-auth-buttons">
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => onOpenAuth('login')}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                className="portal-btn-primary glow-pulse"
                onClick={onOpenOnboarding}
              >
                Solicitar Crédito ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
