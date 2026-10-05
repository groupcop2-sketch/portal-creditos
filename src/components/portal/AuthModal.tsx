import React, { useState } from 'react';
import type { PortalCatalogs } from '../../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'registro' | 'forgot';
  catalogs: PortalCatalogs;
  onLogin: (identificacion: string, password: string) => Promise<boolean>;
  onRegister: (data: any) => Promise<boolean>;
  onForgotPassword: (correo: string) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  catalogs,
  onLogin,
  onRegister,
  onForgotPassword
}) => {
  const [mode, setMode] = useState<'login' | 'registro' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form
  const [loginIdentificacion, setLoginIdentificacion] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const defaultTipId = catalogs.tiposIdentificacion.find(t => t.sigla === 'CC' || t.descripcion.toLowerCase().includes('ciudadan'))?.id
    || catalogs.tiposIdentificacion[0]?.id
    || 6;
  const [regTipoDoc, setRegTipoDoc] = useState(String(defaultTipId));

  React.useEffect(() => {
    if (catalogs.tiposIdentificacion.length > 0) {
      const cc = catalogs.tiposIdentificacion.find(t => t.sigla === 'CC' || t.descripcion.toLowerCase().includes('ciudadan'));
      setRegTipoDoc(String(cc?.id || catalogs.tiposIdentificacion[0].id));
    }
  }, [catalogs.tiposIdentificacion]);

  const [regIdentificacion, setRegIdentificacion] = useState('');
  const [regPrimerNombre, setRegPrimerNombre] = useState('');
  const [regSegundoNombre, setRegSegundoNombre] = useState('');
  const [regPrimerApellido, setRegPrimerApellido] = useState('');
  const [regSegundoApellido, setRegSegundoApellido] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot form
  const [forgotCorreo, setForgotCorreo] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentificacion.trim() || !loginPassword.trim()) {
      setErrorMessage('Ingresa tu identificación y contraseña.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const ok = await onLogin(loginIdentificacion, loginPassword);
      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Credenciales incorrectas. Verifica tu número y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regIdentificacion.trim() || !regPrimerNombre.trim() || !regPrimerApellido.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos (*).');
      return;
    }
    if (!regCorreo.trim() || !regCorreo.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const ok = await onRegister({
        idTipoIdentificacion: Number(regTipoDoc) || defaultTipId,
        identificacion: regIdentificacion,
        primerNombre: regPrimerNombre,
        segundoNombre: regSegundoNombre || null,
        primerApellido: regPrimerApellido,
        segundoApellido: regSegundoApellido || null,
        telefono: regTelefono || null,
        correo: regCorreo,
        password: regPassword
      });
      if (ok) {
        setSuccessMessage('¡Cuenta creada con éxito! Ya puedes iniciar sesión con tus credenciales.');
        setMode('login');
        setLoginIdentificacion(regIdentificacion);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCorreo.trim()) {
      setErrorMessage('Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await onForgotPassword(forgotCorreo);
      setSuccessMessage('Si tu correo está registrado, recibirás un enlace con instrucciones para restablecer tu contraseña.');
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-modal-overlay">
      <div className="auth-modal-card">
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          title="Cerrar modal"
        >
          ✕
        </button>

        {/* Tab Switcher */}
        <div className="auth-tabs-header">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'registro' ? 'active' : ''}`}
            onClick={() => {
              setMode('registro');
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Notification Alerts */}
        {errorMessage && (
          <div className="onboarding-error-banner">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="onboarding-success-banner">
            <span>✓ {successMessage}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {mode === 'login' && (
          <form className="auth-form animate-fadeIn" onSubmit={handleLoginSubmit}>
            <div className="auth-header-copy">
              <h3>Ingresa a tu cuenta</h3>
              <p>Consulta el estado de tus solicitudes y gestiona tus créditos activos.</p>
            </div>

            <div className="form-field full-width">
              <label className="field-label-bold">Número de Cédula o Correo *</label>
              <input
                type="text"
                className="portal-input-text"
                placeholder="Ej. 1020304050 o usuario@correo.com"
                value={loginIdentificacion}
                onChange={(e) => setLoginIdentificacion(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-field full-width">
              <div className="label-with-value">
                <label className="field-label-bold">Contraseña *</label>
                <button
                  type="button"
                  className="link-subtle-small"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="portal-input-text"
                  placeholder="Tu contraseña"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="portal-btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión ➔'}
            </button>

            <div className="auth-switch-note">
              <span>¿No tienes una cuenta aún?</span>{' '}
              <button
                type="button"
                className="link-btn-text"
                onClick={() => setMode('registro')}
              >
                Regístrate aquí
              </button>
            </div>
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {mode === 'registro' && (
          <form className="auth-form animate-fadeIn" onSubmit={handleRegisterSubmit}>
            <div className="auth-header-copy">
              <h3>Crea tu cuenta de cliente</h3>
              <p>Regístrate en un minuto y accede a tu simulador y solicitudes.</p>
            </div>

            <div className="two-cols-compact">
              <div className="form-field">
                <label className="field-label-bold">Tipo Doc *</label>
                <select
                  className="portal-input-select"
                  value={regTipoDoc}
                  onChange={(e) => setRegTipoDoc(e.target.value)}
                >
                  {catalogs.tiposIdentificacion.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.sigla}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="field-label-bold">Identificación *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="No. documento"
                  value={regIdentificacion}
                  onChange={(e) => setRegIdentificacion(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="two-cols-compact">
              <div className="form-field">
                <label className="field-label-bold">Primer Nombre *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Nombre"
                  value={regPrimerNombre}
                  onChange={(e) => setRegPrimerNombre(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="field-label-bold">Primer Apellido *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Apellido"
                  value={regPrimerApellido}
                  onChange={(e) => setRegPrimerApellido(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="two-cols-compact">
              <div className="form-field">
                <label className="field-label-bold">Teléfono Celular *</label>
                <input
                  type="tel"
                  className="portal-input-text"
                  placeholder="310 123 4567"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="field-label-bold">Correo Electrónico *</label>
                <input
                  type="email"
                  className="portal-input-text"
                  placeholder="correo@ejemplo.com"
                  value={regCorreo}
                  onChange={(e) => setRegCorreo(e.target.value.toLowerCase())}
                  required
                />
              </div>
            </div>

            <div className="form-field full-width">
              <label className="field-label-bold">Crea tu Contraseña *</label>
              <div className="password-input-wrapper">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  className="portal-input-text"
                  placeholder="Mínimo 8 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="portal-btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Mi Cuenta ➔'}
            </button>

            <div className="auth-switch-note">
              <span>¿Ya tienes cuenta?</span>{' '}
              <button
                type="button"
                className="link-btn-text"
                onClick={() => setMode('login')}
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD FORM ================= */}
        {mode === 'forgot' && (
          <form className="auth-form animate-fadeIn" onSubmit={handleForgotSubmit}>
            <div className="auth-header-copy">
              <h3>Recuperar Contraseña</h3>
              <p>Ingresa el correo electrónico con el que te registraste y te enviaremos un enlace seguro para restablecerla.</p>
            </div>

            <div className="form-field full-width">
              <label className="field-label-bold">Correo Registrado *</label>
              <input
                type="email"
                className="portal-input-text"
                placeholder="ejemplo@correo.com"
                value={forgotCorreo}
                onChange={(e) => setForgotCorreo(e.target.value.toLowerCase())}
                required
              />
            </div>

            <button
              type="submit"
              className="portal-btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación ➔'}
            </button>

            <div className="auth-switch-note">
              <button
                type="button"
                className="link-btn-text"
                onClick={() => setMode('login')}
              >
                ◀ Volver a Iniciar Sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
