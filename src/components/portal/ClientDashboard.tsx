import React, { useState, useEffect } from 'react';
import {
  api,
  type PortalCatalogs,
  type PortalCliente,
  type PortalCreditosResponse,
  type PortalProductoCredito
} from '../../api';
import { DocumentoRostroUploader } from './DocumentoRostroUploader';

interface ClientDashboardProps {
  cliente: PortalCliente;
  creditosData: PortalCreditosResponse;
  productos: PortalProductoCredito[];
  catalogs: PortalCatalogs;
  token?: string | null;
  onRefreshSession?: () => void;
  onOpenNewCredit: () => void;
  onCompleteLaborProfile: (data: any) => Promise<boolean>;
  formatMoney: (val?: number | null) => string;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  cliente,
  creditosData,
  productos,
  catalogs,
  token,
  onRefreshSession,
  onOpenNewCredit,
  onCompleteLaborProfile,
  formatMoney
}) => {
  const [showLaborModal, setShowLaborModal] = useState(!cliente.perfilCompleto);
  const [showManualUploadModal, setShowManualUploadModal] = useState(false);
  const [hasJumioConfig, setHasJumioConfig] = useState<boolean | null>(null);
  const [laborCodigoEmpresa, setLaborCodigoEmpresa] = useState(cliente.codigoEmpresa || '');
  const [laborCargo, setLaborCargo] = useState(cliente.cargo || '');
  const [isCustomLaborCargo, setIsCustomLaborCargo] = useState(false);
  const [laborSalario, setLaborSalario] = useState(cliente.salario ? String(cliente.salario) : '');
  const [laborNeto, setLaborNeto] = useState(cliente.neto ? String(cliente.neto) : '');
  const [laborTieneEmbargos, setLaborTieneEmbargos] = useState(false);
  const [laborLoading, setLaborLoading] = useState(false);
  const [laborError, setLaborError] = useState('');

  useEffect(() => {
    api.obtenerConfigJumio()
      .then((cfg) => setHasJumioConfig(Boolean(cfg?.jumioConfigurado)))
      .catch(() => setHasJumioConfig(false));
  }, []);

  // Latest active credit for the pipeline visualizer
  const latestCredito = creditosData.creditos[0] || null;

  const getInitials = (name?: string) => {
    if (!name) return 'CL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Pipeline stages calculation
  const getStageIndex = (estado?: string, jumioEstado?: string) => {
    if (!estado) return 1;
    const est = estado.toUpperCase();
    if (est.includes('DESEMBOLS')) return 6;
    if (est.includes('FIRMA') || est.includes('DOCUSIGN')) return 5;
    if (est.includes('APROBAD')) return 4;
    if (est.includes('ESTUDIO') || est.includes('ANALIS') || jumioEstado === 'APROBADO') return 3;
    if (est.includes('DOCUMENT') || est.includes('VALIDAC') || est.includes('JUMIO') || est.includes('BIOMETR')) return 2;
    if (est.includes('RADICAD') || est.includes('SOLICITAD') || est.includes('PENDIENTE')) {
      return jumioEstado === 'APROBADO' ? 3 : 2;
    }
    return 2;
  };

  const currentStageNum = getStageIndex(latestCredito?.estado, latestCredito?.jumioEstado);

  const pipelineStages = [
    { num: 1, name: 'Radicación', sub: 'Completada' },
    { num: 2, name: 'Biometría Jumio', sub: 'Identidad digital' },
    { num: 3, name: 'Estudio de Crédito', sub: 'Capacidad de pago' },
    { num: 4, name: 'Aprobación', sub: 'Comité de crédito' },
    { num: 5, name: 'Firma DocuSign', sub: 'Pagaré digital' },
    { num: 6, name: 'Desembolso', sub: 'En tu cuenta' }
  ];

  const handleLaborSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laborCodigoEmpresa.trim() || !laborCargo.trim() || !laborSalario) {
      setLaborError('Por favor completa todos los campos requeridos.');
      return;
    }
    setLaborLoading(true);
    setLaborError('');
    try {
      const ok = await onCompleteLaborProfile({
        codigoEmpresa: laborCodigoEmpresa.toUpperCase(),
        cargo: laborCargo,
        idTipoContrato: 1,
        fechaIngreso: new Date().toISOString().slice(0, 10),
        salario: Number(laborSalario),
        neto: Number(laborNeto || laborSalario),
        tieneEmbargos: laborTieneEmbargos
      });
      if (ok) {
        setShowLaborModal(false);
      }
    } catch (err: any) {
      setLaborError(err.message || 'No se pudo actualizar el perfil laboral.');
    } finally {
      setLaborLoading(false);
    }
  };

  return (
    <div className="client-dashboard-screen animate-fadeIn">
      {/* 1. Header Banner Card */}
      <section className="dashboard-hero-banner">
        <div className="dashboard-hero-content">
          <div className="dashboard-avatar-big">
            <span>{getInitials(cliente.nombreCompleto)}</span>
          </div>
          <div className="dashboard-user-titles">
            <span className="welcome-tag">PORTAL DEL CLIENTE</span>
            <h2>Bienvenido, {cliente.nombreCompleto}</h2>
            <div className="user-meta-chips">
              <span className="meta-chip">🏢 Empresa: <strong>{cliente.empresa || 'Convenio activo'}</strong></span>
              <span className="meta-chip">🆔 Cédula: <strong>{cliente.identificacion}</strong></span>
              <span className="meta-chip">💼 Salario: <strong>{formatMoney(cliente.salario)}</strong></span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="portal-btn-primary glow-pulse"
          onClick={onOpenNewCredit}
        >
          + Solicitar Nuevo Crédito
        </button>
      </section>

      {/* 2. Incomplete Profile Notice Banner */}
      {!cliente.perfilCompleto && (
        <div className="incomplete-profile-banner">
          <div className="banner-left">
            <span className="banner-icon">⚠️</span>
            <div>
              <strong>Información laboral pendiente</strong>
              <p>Vincula el código de convenio de tu empresa para autorizar el descuento por nómina y habilitar desembolsos.</p>
            </div>
          </div>
          <button
            type="button"
            className="portal-btn-secondary"
            onClick={() => setShowLaborModal(true)}
          >
            Completar Ahora ➔
          </button>
        </div>
      )}

      {/* 3. Metrics Summary Grid */}
      <section className="dashboard-metrics-grid">
        <div className="dashboard-metric-card">
          <div className="metric-icon-box blue">💳</div>
          <div className="metric-info">
            <span className="metric-label">Créditos Activos</span>
            <strong className="metric-value">{creditosData.resumen.activos}</strong>
            <span className="metric-sub">Obligaciones vigentes</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="metric-icon-box amber">⏱️</div>
          <div className="metric-info">
            <span className="metric-label">En Estudio o Radicadas</span>
            <strong className="metric-value">{creditosData.resumen.solicitados}</strong>
            <span className="metric-sub">Solicitudes en trámite</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="metric-icon-box green">✓</div>
          <div className="metric-info">
            <span className="metric-label">Aprobados</span>
            <strong className="metric-value text-success">{creditosData.resumen.aprobados}</strong>
            <span className="metric-sub">Pendientes de desembolso</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="metric-icon-box purple">📅</div>
          <div className="metric-info">
            <span className="metric-label">Descuento de Nómina</span>
            <strong className="metric-value">Automático</strong>
            <span className="metric-sub">Día 25 - 30 de cada mes</span>
          </div>
        </div>
      </section>

      {/* 4. Active Application Pipeline Visualizer */}
      {latestCredito && (
        <section className="dashboard-pipeline-card">
          <div className="pipeline-card-header">
            <div>
              <span className="section-badge-pill">SEGUIMIENTO EN VIVO</span>
              <h3>Solicitud #{latestCredito.consecutivo} · {latestCredito.producto}</h3>
              <p>Monto: <strong>{formatMoney(latestCredito.monto)}</strong> a <strong>{latestCredito.plazo} meses</strong></p>
            </div>
            <span className={`status-pill status-${latestCredito.estado.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              {latestCredito.estado.replaceAll('_', ' ')}
            </span>
          </div>
 
          {currentStageNum <= 2 && latestCredito.jumioEstado !== 'APROBADO' && !latestCredito.estado.toUpperCase().includes('ESTUDIO') && (
            <div className="pipeline-jumio-banner">
              <div className="pj-content">
                <span className="pj-badge">🛡️ Validación de Identidad Requerida</span>
                <p>Tu crédito requiere validación de cédula y fotografía del rostro para avanzar al estudio de crédito.</p>
              </div>
              <div className="pj-actions">
                <button
                  type="button"
                  className="portal-btn-primary glow-pulse"
                  onClick={() => setShowManualUploadModal(true)}
                >
                  📷 Cargar Documento y Rostro ➔
                </button>
                {hasJumioConfig && (
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    onClick={async () => {
                      try {
                        const effectiveToken = token || localStorage.getItem('portal_client_token') || '';
                        const res = await api.iniciarVerificacionJumio(effectiveToken, latestCredito.id);
                        if (res?.webHref) {
                          window.open(res.webHref, '_blank');
                        } else {
                          alert('No se recibió la URL de verificación de Jumio');
                        }
                      } catch (err: any) {
                        alert(`Error al iniciar Jumio: ${err.message || 'Verifica la configuración del servidor'}`);
                      }
                    }}
                  >
                    Validar con Jumio
                  </button>
                )}
                <button
                  type="button"
                  className="btn-simulation-demo-sm"
                  onClick={async () => {
                    try {
                      const effectiveToken = token || localStorage.getItem('portal_client_token') || '';
                      await api.simularCompletarJumio(effectiveToken, latestCredito.id, 'PASSED');
                      if (onRefreshSession) onRefreshSession();
                    } catch (err: any) {
                      console.warn('Error al simular Jumio:', err);
                    }
                  }}
                >
                  ⚡ Simular Aprobación
                </button>
              </div>
            </div>
          )}

          <div className="pipeline-stepper-row">
            {pipelineStages.map((stage) => {
              const isPast = stage.num < currentStageNum;
              const isCurrent = stage.num === currentStageNum;
              const isPending = stage.num > currentStageNum;

              let nodeClass = 'pending';
              if (isPast) nodeClass = 'completed';
              if (isCurrent) nodeClass = 'active';

              return (
                <div key={stage.num} className={`pipeline-stage-node ${nodeClass}`}>
                  <div className="node-marker">
                    {isPast ? '✓' : stage.num}
                  </div>
                  <div className="node-texts">
                    <span className="node-name">{stage.name}</span>
                    <small className="node-sub">{stage.sub}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Applications and Credits Table */}
      <section className="dashboard-table-card">
        <div className="table-card-header">
          <div>
            <h3>Mis solicitudes y créditos</h3>
            <p>Historial completo de operaciones radicadas en la plataforma.</p>
          </div>
          <span className="records-count-badge">
            {creditosData.creditos.length} registros
          </span>
        </div>

        {creditosData.creditos.length > 0 ? (
          <div className="table-responsive-wrapper">
            <table className="portal-data-table">
              <thead>
                <tr>
                  <th>Radicado</th>
                  <th>Línea de Crédito</th>
                  <th>Fecha Radicación</th>
                  <th>Monto Solicitado</th>
                  <th>Plazo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {creditosData.creditos.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong className="consecutivo-link">#{c.consecutivo}</strong>
                    </td>
                    <td>{c.producto}</td>
                    <td>{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                    <td>
                      <strong>{formatMoney(c.monto)}</strong>
                    </td>
                    <td>{c.plazo} cuotas</td>
                    <td>
                      <span className={`status-pill status-${c.estado.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        {c.estado.replaceAll('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-panel">
            <span className="empty-icon">📭</span>
            <h4>Aún no tienes solicitudes de crédito</h4>
            <p>Simula tu cuota y solicita tu primer crédito de libranza en minutos.</p>
            <button
              type="button"
              className="portal-btn-primary glow-pulse"
              onClick={onOpenNewCredit}
            >
              Simular mi Crédito Ahora ➔
            </button>
          </div>
        )}
      </section>

      {/* Labor Profile Modal if user opens it */}
      {showLaborModal && (
        <div className="onboarding-modal-overlay">
          <div className="auth-modal-card">
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowLaborModal(false)}
            >
              ✕
            </button>

            <form onSubmit={handleLaborSubmit} className="auth-form">
              <div className="auth-header-copy">
                <h3>Completa tu perfil laboral</h3>
                <p>Vincula tu empresa para habilitar el desembolso por libranza.</p>
              </div>

              {laborError && (
                <div className="onboarding-error-banner">
                  <span>⚠️ {laborError}</span>
                </div>
              )}

              <div className="form-field full-width">
                <label className="field-label-bold">Código de convenio de la empresa *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Ej. KALTIRE, EMP-001"
                  value={laborCodigoEmpresa}
                  onChange={(e) => setLaborCodigoEmpresa(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="form-field full-width">
                <label className="field-label-bold">Cargo / Ocupación *</label>
                {!isCustomLaborCargo ? (
                  <select
                    className="portal-input-select"
                    value={laborCargo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__OTRO__') {
                        setIsCustomLaborCargo(true);
                        setLaborCargo('');
                      } else {
                        setIsCustomLaborCargo(false);
                        setLaborCargo(val);
                      }
                    }}
                    required
                  >
                    <option value="">Selecciona tu cargo / ocupación</option>
                    {(catalogs.cargos || []).map((c) => (
                      <option key={c.id || c.nombre} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                    {laborCargo && !(catalogs.cargos || []).some((c) => c.nombre.toLowerCase() === laborCargo.toLowerCase()) && (
                      <option value={laborCargo}>{laborCargo}</option>
                    )}
                    <option value="__OTRO__">Otro / No listado</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="portal-input-text"
                      placeholder="Escribe tu cargo u ocupación"
                      value={laborCargo}
                      onChange={(e) => setLaborCargo(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      style={{ whiteSpace: 'nowrap', padding: '0 12px', fontSize: '12px' }}
                      onClick={() => {
                        setIsCustomLaborCargo(false);
                        setLaborCargo('');
                      }}
                    >
                      Volver a lista
                    </button>
                  </div>
                )}
              </div>

              <div className="two-cols-compact">
                <div className="form-field">
                  <label className="field-label-bold">Salario Básico *</label>
                  <input
                    type="number"
                    className="portal-input-text"
                    placeholder="Ej. 2500000"
                    value={laborSalario}
                    onChange={(e) => setLaborSalario(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label-bold">Ingreso Neto</label>
                  <input
                    type="number"
                    className="portal-input-text"
                    placeholder="Ej. 2100000"
                    value={laborNeto}
                    onChange={(e) => setLaborNeto(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label className="checkbox-custom-row">
                  <input
                    type="checkbox"
                    checked={laborTieneEmbargos}
                    onChange={(e) => setLaborTieneEmbargos(e.target.checked)}
                  />
                  <span>Actualmente tengo embargos de nómina.</span>
                </label>
              </div>

              <button
                type="submit"
                className="portal-btn-primary full-width"
                disabled={laborLoading}
              >
                {laborLoading ? 'Guardando...' : 'Guardar Información Laboral ➔'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Document and Face Upload Modal */}
      {showManualUploadModal && latestCredito && (
        <div className="onboarding-modal-overlay">
          <div className="onboarding-modal-card doc-modal-card animate-fadeIn">
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowManualUploadModal(false)}
              title="Cerrar modal"
            >
              ✕
            </button>
            <DocumentoRostroUploader
              creditoId={latestCredito.id}
              token={token}
              showCancelButton={true}
              onCancel={() => setShowManualUploadModal(false)}
              onSuccess={() => {
                setShowManualUploadModal(false);
                if (onRefreshSession) onRefreshSession();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
