import React, { useState, useEffect } from 'react';
import {
  api,
  type PortalCatalogs,
  type PortalCliente,
  type PortalProductoCredito
} from '../../api';

export interface OnboardingInitialData {
  monto: number;
  plazo: number;
  idProductoCredito?: number;
  productoNombre?: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: OnboardingInitialData;
  catalogs: PortalCatalogs;
  productos: PortalProductoCredito[];
  cliente: PortalCliente | null;
  token?: string | null;
  onRegisterAndSubmit: (formData: any) => Promise<{
    success: boolean;
    consecutivo?: string;
    creditoId?: number;
    jumio?: any;
    error?: string;
  }>;
  onLoginClient: (identificacion: string, password: string) => Promise<boolean>;
  onSwitchToLogin: () => void;
  formatMoney: (val?: number | null) => string;
  onCompletedBiometrics?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialData,
  catalogs,
  productos,
  cliente,
  token,
  onRegisterAndSubmit,
  onLoginClient,
  onSwitchToLogin,
  formatMoney,
  onCompletedBiometrics
}) => {
  // Current Step: 1, 2, 3, 4, or 5 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [consecutivoGenerado, setConsecutivoGenerado] = useState<string>('');
  const [creditoGeneradoId, setCreditoGeneradoId] = useState<number | null>(null);
  const [jumioData, setJumioData] = useState<any>(null);
  const [jumioStatus, setJumioStatus] = useState<'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('PENDIENTE');
  const [simulatingJumio, setSimulatingJumio] = useState(false);

  // Form State
  const [monto, setMonto] = useState<number>(initialData.monto || 10000000);
  const [plazo, setPlazo] = useState<number>(initialData.plazo || 24);
  const [idProductoCredito, setIdProductoCredito] = useState<string>(
    initialData.idProductoCredito ? String(initialData.idProductoCredito) : ''
  );
  const [codigoVendedor, setCodigoVendedor] = useState('');

  // Personal data
  const [idTipoIdentificacion, setIdTipoIdentificacion] = useState<string>('');
  const [identificacion, setIdentificacion] = useState('');
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Labor data
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [cargo, setCargo] = useState('');
  const [isCustomCargo, setIsCustomCargo] = useState(false);
  const [idTipoContrato, setIdTipoContrato] = useState<string>('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [salario, setSalario] = useState('');
  const [neto, setNeto] = useState('');
  const [tieneEmbargos, setTieneEmbargos] = useState(false);

  // Confirmations
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaHabeasData, setAceptaHabeasData] = useState(false);

  // Sync initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setMonto(initialData.monto || 10000000);
      setPlazo(initialData.plazo || 24);
      if (initialData.idProductoCredito) {
        setIdProductoCredito(String(initialData.idProductoCredito));
      } else if (productos.length > 0) {
        setIdProductoCredito(String(productos[0].id));
      }
      if (catalogs.tiposIdentificacion.length > 0 && !idTipoIdentificacion) {
        setIdTipoIdentificacion(String(catalogs.tiposIdentificacion[0].id));
      }
      if (catalogs.tiposContrato.length > 0 && !idTipoContrato) {
        setIdTipoContrato(String(catalogs.tiposContrato[0].id));
      }

      // If user already logged in, autofill and start at step 3 or 4
      if (cliente) {
        setIdentificacion(cliente.identificacion || '');
        const parts = (cliente.nombreCompleto || '').split(/\s+/);
        setPrimerNombre(parts[0] || '');
        setPrimerApellido(parts[1] || '');
        setCorreo(cliente.correo || '');
        setTelefono(cliente.telefono || '');
        setCodigoEmpresa(cliente.codigoEmpresa || '');
        setCargo(cliente.cargo || '');
        setIsCustomCargo(false);
        setSalario(cliente.salario ? String(cliente.salario) : '');
        setNeto(cliente.neto ? String(cliente.neto) : '');
        if (cliente.perfilCompleto) {
          setCurrentStep(1); // will go straight to step 4 when advancing
        }
      } else {
        setCurrentStep(1);
        setIsCustomCargo(false);
      }
      setErrorMessage('');
      setConsecutivoGenerado('');
    }
  }, [isOpen, initialData, productos, catalogs, cliente]);

  if (!isOpen) return null;

  // Real-time calculation
  const tasaMensual = 0.0145;
  const tasaFianza = 0.002;
  const cuotaEstimada = Math.round(
    (monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo))) /
      (Math.pow(1 + tasaMensual, plazo) - 1) +
      monto * tasaFianza
  );

  const selectedProd = productos.find((p) => String(p.id) === idProductoCredito) || productos[0];

  // Step Validation & Navigation
  const handleNextFromStep1 = () => {
    if (!idProductoCredito) {
      setErrorMessage('Por favor selecciona una línea de crédito.');
      return;
    }
    if (monto < (selectedProd?.montoMinimo || 1000000) || monto > (selectedProd?.montoMaximo || 50000000)) {
      setErrorMessage(`El monto debe estar entre ${formatMoney(selectedProd?.montoMinimo || 1000000)} y ${formatMoney(selectedProd?.montoMaximo || 50000000)}.`);
      return;
    }
    setErrorMessage('');
    // If logged in and profile complete, jump straight to review
    if (cliente && cliente.perfilCompleto) {
      setCurrentStep(4);
    } else if (cliente) {
      setCurrentStep(3); // needs labor profile
    } else {
      setCurrentStep(2); // needs personal register
    }
  };

  const handleNextFromStep2 = () => {
    if (!identificacion.trim()) {
      setErrorMessage('Ingresa tu número de identificación.');
      return;
    }
    if (!primerNombre.trim() || !primerApellido.trim()) {
      setErrorMessage('Ingresa tus nombres y apellidos completos.');
      return;
    }
    if (!correo.trim() || !correo.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }
    if (!telefono.trim() || telefono.length < 7) {
      setErrorMessage('Ingresa un número de celular o teléfono válido.');
      return;
    }
    if (!cliente && password.length < 8) {
      setErrorMessage('La contraseña debe tener mínimo 8 caracteres para proteger tu cuenta.');
      return;
    }
    setErrorMessage('');
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!codigoEmpresa.trim()) {
      setErrorMessage('Ingresa el código de convenio de tu empresa.');
      return;
    }
    if (!cargo.trim()) {
      setErrorMessage('Ingresa tu cargo u ocupación actual.');
      return;
    }
    if (!salario || Number(salario) <= 0) {
      setErrorMessage('Ingresa tu salario mensual devengado.');
      return;
    }
    setErrorMessage('');
    setCurrentStep(4);
  };

  const handleSubmitApplication = async () => {
    if (!aceptaTerminos || !aceptaHabeasData) {
      setErrorMessage('Debes aceptar los términos y condiciones y el tratamiento de datos personales para continuar.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        monto,
        montoSolicitado: monto,
        plazo,
        idProductoCredito: Number(idProductoCredito) || selectedProd?.id,
        codigoVendedor: codigoVendedor ? codigoVendedor.toUpperCase() : null,
        // personal
        idTipoIdentificacion: idTipoIdentificacion ? Number(idTipoIdentificacion) : 1,
        identificacion,
        primerNombre,
        segundoNombre: segundoNombre || null,
        primerApellido,
        segundoApellido: segundoApellido || null,
        correo,
        telefono,
        password: password || undefined,
        // labor
        codigoEmpresa: codigoEmpresa.toUpperCase(),
        cargo,
        idTipoContrato: idTipoContrato ? Number(idTipoContrato) : 1,
        fechaIngreso: fechaIngreso || new Date().toISOString().slice(0, 10),
        salario: Number(salario),
        neto: Number(neto || salario),
        tieneEmbargos
      };

      const result = await onRegisterAndSubmit(payload);

      if (result.success) {
        setConsecutivoGenerado(result.consecutivo || 'RAD-OK');
        if (result.creditoId) setCreditoGeneradoId(result.creditoId);
        if (result.jumio) setJumioData(result.jumio);
        setJumioStatus('PENDIENTE');
        setCurrentStep(5); // Step 5: Validación Biométrica Jumio
      } else {
        setErrorMessage(result.error || 'Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimularJumio = async () => {
    if (!creditoGeneradoId) {
      setJumioStatus('APROBADO');
      return;
    }
    setSimulatingJumio(true);
    try {
      await api.simularCompletarJumio(token || '', creditoGeneradoId, 'PASSED');
      setJumioStatus('APROBADO');
      if (onCompletedBiometrics) onCompletedBiometrics();
    } catch (err) {
      setJumioStatus('APROBADO');
    } finally {
      setSimulatingJumio(false);
    }
  };

  return (
    <div className="onboarding-modal-overlay">
      <div className="onboarding-modal-card">
        {/* Modal Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          title="Cerrar modal"
        >
          ✕
        </button>

        {/* Step Progress Tracker */}
        {currentStep < 5 && (
          <div className="onboarding-stepper-header">
            <div className="stepper-track-line">
              <div
                className="stepper-track-fill"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>
            <div className="stepper-dots-row">
              <div className={`stepper-node ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
                <span className="node-circle">{currentStep > 1 ? '✓' : '1'}</span>
                <span className="node-label">Crédito</span>
              </div>
              <div className={`stepper-node ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
                <span className="node-circle">{currentStep > 2 ? '✓' : '2'}</span>
                <span className="node-label">Tus Datos</span>
              </div>
              <div className={`stepper-node ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
                <span className="node-circle">{currentStep > 3 ? '✓' : '3'}</span>
                <span className="node-label">Empresa</span>
              </div>
              <div className={`stepper-node ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}`}>
                <span className="node-circle">{currentStep === 4 ? '4' : '4'}</span>
                <span className="node-label">Confirmación</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="onboarding-error-banner">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: TU CRÉDITO ================= */}
        {currentStep === 1 && (
          <div className="onboarding-step-body animate-fadeIn">
            <div className="step-heading">
              <span className="step-kicker">PASO 1 DE 4</span>
              <h2>Personaliza las condiciones de tu crédito</h2>
              <p>Elige el producto, monto y plazo para ajustar la cuota que mejor se adapte a tu nómina.</p>
            </div>

            <div className="onboarding-form-grid">
              {/* Product Select */}
              <div className="form-field full-width">
                <label className="field-label-bold">Línea de crédito solicitada:</label>
                <select
                  className="portal-input-select"
                  value={idProductoCredito}
                  onChange={(e) => setIdProductoCredito(e.target.value)}
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Desde {formatMoney(p.montoMinimo)} hasta {formatMoney(p.montoMaximo)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount slider and input */}
              <div className="form-field full-width">
                <div className="label-with-value">
                  <label className="field-label-bold">Monto solicitado:</label>
                  <strong className="text-highlight-amount">{formatMoney(monto)}</strong>
                </div>
                <input
                  type="range"
                  className="simulator-slider"
                  min={selectedProd?.montoMinimo || 1000000}
                  max={selectedProd?.montoMaximo || 50000000}
                  step={500000}
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                />
              </div>

              {/* Term slider and input */}
              <div className="form-field full-width">
                <div className="label-with-value">
                  <label className="field-label-bold">Plazo de pago en meses:</label>
                  <strong className="text-highlight-term">{plazo} cuotas mensuales</strong>
                </div>
                <input
                  type="range"
                  className="simulator-slider"
                  min={selectedProd?.plazoMinimo || 6}
                  max={selectedProd?.plazoMaximo || 60}
                  step={6}
                  value={plazo}
                  onChange={(e) => setPlazo(Number(e.target.value))}
                />
              </div>

              {/* Optional Advisor Code */}
              <div className="form-field full-width">
                <label className="field-label-bold">Código del asesor o vendedor (Opcional):</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Ej. VEN-001 o Código de tu promotor"
                  value={codigoVendedor}
                  onChange={(e) => setCodigoVendedor(e.target.value.toUpperCase())}
                />
              </div>

              {/* Fee Estimation Banner */}
              <div className="onboarding-fee-card">
                <div className="fee-col">
                  <span>Cuota mensual estimada:</span>
                  <strong>{formatMoney(cuotaEstimada)}</strong>
                </div>
                <div className="fee-col right">
                  <span>Tasa fija mensual:</span>
                  <strong className="text-success">1.45% M.V.</strong>
                </div>
              </div>
            </div>

            <div className="onboarding-actions-footer">
              <button type="button" className="btn-secondary-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="portal-btn-primary" onClick={handleNextFromStep1}>
                Continuar a Mis Datos ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: TUS DATOS PERSONALES ================= */}
        {currentStep === 2 && (
          <div className="onboarding-step-body animate-fadeIn">
            <div className="step-heading">
              <div className="heading-with-auth-toggle">
                <div>
                  <span className="step-kicker">PASO 2 DE 4</span>
                  <h2>Información personal y de contacto</h2>
                </div>
                {!cliente && (
                  <button
                    type="button"
                    className="link-btn-subtle"
                    onClick={() => {
                      onClose();
                      onSwitchToLogin();
                    }}
                  >
                    ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
                  </button>
                )}
              </div>
              <p>Garantizamos la privacidad y seguridad de tu información conforme a la ley colombiana.</p>
            </div>

            <div className="onboarding-form-grid two-columns">
              <div className="form-field">
                <label className="field-label-bold">Tipo de Documento *</label>
                <select
                  className="portal-input-select"
                  value={idTipoIdentificacion}
                  onChange={(e) => setIdTipoIdentificacion(e.target.value)}
                >
                  {catalogs.tiposIdentificacion.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.sigla} - {t.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="field-label-bold">Número de Identificación *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Ej. 1020304050"
                  value={identificacion}
                  onChange={(e) => setIdentificacion(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Primer Nombre *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Tu primer nombre"
                  value={primerNombre}
                  onChange={(e) => setPrimerNombre(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Segundo Nombre</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Opcional"
                  value={segundoNombre}
                  onChange={(e) => setSegundoNombre(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Primer Apellido *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Tu primer apellido"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Segundo Apellido</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Opcional"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Celular / Teléfono *</label>
                <input
                  type="tel"
                  className="portal-input-text"
                  placeholder="Ej. 310 123 4567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Correo Electrónico *</label>
                <input
                  type="email"
                  className="portal-input-text"
                  placeholder="nombre@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value.toLowerCase())}
                />
              </div>

              {!cliente && (
                <div className="form-field full-width">
                  <label className="field-label-bold">Crea una contraseña segura *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="portal-input-text"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <small className="field-hint">La usarás para consultar el estado de tu crédito en cualquier momento.</small>
                </div>
              )}
            </div>

            <div className="onboarding-actions-footer">
              <button type="button" className="btn-secondary-ghost" onClick={() => setCurrentStep(1)}>
                ◀ Volver
              </button>
              <button type="button" className="portal-btn-primary" onClick={handleNextFromStep2}>
                Continuar a Información Laboral ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: EMPRESA Y CONTRATO ================= */}
        {currentStep === 3 && (
          <div className="onboarding-step-body animate-fadeIn">
            <div className="step-heading">
              <span className="step-kicker">PASO 3 DE 4</span>
              <h2>Vinculación laboral y empresa</h2>
              <p>Los créditos de libranza requieren convenio activo con tu empleador.</p>
            </div>

            <div className="onboarding-form-grid two-columns">
              <div className="form-field full-width">
                <label className="field-label-bold">Código de convenio de tu empresa *</label>
                <input
                  type="text"
                  className="portal-input-text"
                  placeholder="Ej. EMP-KAL-001, 7781, KALTIRE, EMP-001"
                  list="convenios-list"
                  value={codigoEmpresa}
                  onChange={(e) => setCodigoEmpresa(e.target.value.toUpperCase())}
                />
                <datalist id="convenios-list">
                  {((catalogs as any).empresas || []).map((emp: any) => (
                    <option key={emp.id} value={emp.codigo}>
                      {emp.codigo} - {emp.nombre}
                    </option>
                  ))}
                  <option value="EMP-KAL-001">EMP-KAL-001 - KAL TIRE S.A.</option>
                  <option value="7781">7781 - P&S SOLUCIONES FINANCIERAS</option>
                  <option value="8017">8017 - GRUPO LUX S.A.S.</option>
                  <option value="EMP-001">EMP-001 - Convenio General</option>
                </datalist>
                <small className="field-hint">Selecciona de la lista o escribe el código corporativo asignado a tu pagaduría.</small>
              </div>

              <div className="form-field">
                <label className="field-label-bold">Cargo / Ocupación *</label>
                {!isCustomCargo ? (
                  <select
                    className="portal-input-select"
                    value={cargo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__OTRO__') {
                        setIsCustomCargo(true);
                        setCargo('');
                      } else {
                        setIsCustomCargo(false);
                        setCargo(val);
                      }
                    }}
                  >
                    <option value="">Selecciona tu cargo / ocupación</option>
                    {(catalogs.cargos || []).map((c) => (
                      <option key={c.id || c.nombre} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                    {cargo && !(catalogs.cargos || []).some((c) => c.nombre.toLowerCase() === cargo.toLowerCase()) && (
                      <option value={cargo}>{cargo}</option>
                    )}
                    <option value="__OTRO__">Otro / No listado</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="portal-input-text"
                      placeholder="Escribe tu cargo u ocupación"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      style={{ whiteSpace: 'nowrap', padding: '0 12px', fontSize: '12px' }}
                      onClick={() => {
                        setIsCustomCargo(false);
                        setCargo('');
                      }}
                    >
                      Volver a lista
                    </button>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label-bold">Tipo de Contrato *</label>
                <select
                  className="portal-input-select"
                  value={idTipoContrato}
                  onChange={(e) => setIdTipoContrato(e.target.value)}
                >
                  {catalogs.tiposContrato.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="field-label-bold">Fecha de Ingreso a la Empresa *</label>
                <input
                  type="date"
                  className="portal-input-text"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Salario Básico Mensual *</label>
                <input
                  type="number"
                  className="portal-input-text"
                  placeholder="Ej. 2500000"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label-bold">Ingreso Neto Recibido en Nómina</label>
                <input
                  type="number"
                  className="portal-input-text"
                  placeholder="Ej. 2100000 (después de deducciones)"
                  value={neto}
                  onChange={(e) => setNeto(e.target.value)}
                />
              </div>

              <div className="form-field full-width">
                <label className="checkbox-custom-row">
                  <input
                    type="checkbox"
                    checked={tieneEmbargos}
                    onChange={(e) => setTieneEmbargos(e.target.checked)}
                  />
                  <span>Actualmente tengo embargos judiciales sobre mi salario.</span>
                </label>
              </div>
            </div>

            <div className="onboarding-actions-footer">
              <button
                type="button"
                className="btn-secondary-ghost"
                onClick={() => setCurrentStep(cliente && cliente.perfilCompleto ? 1 : 2)}
              >
                ◀ Volver
              </button>
              <button type="button" className="portal-btn-primary" onClick={handleNextFromStep3}>
                Continuar a Confirmación ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CONFIRMACIÓN Y ENVÍO ================= */}
        {currentStep === 4 && (
          <div className="onboarding-step-body animate-fadeIn">
            <div className="step-heading">
              <span className="step-kicker">PASO 4 DE 4</span>
              <h2>Revisa y confirma tu solicitud</h2>
              <p>Estás a un paso de radicar tu crédito 100% digital.</p>
            </div>

            {/* Executive Summary Card */}
            <div className="summary-executive-card">
              <div className="summary-card-header">
                <div>
                  <span className="badge-prod-name">{selectedProd?.nombre || 'Libranza Libre Inversión'}</span>
                  <h3>Resumen Financiero</h3>
                </div>
                <div className="summary-header-rate">
                  <span>Tasa fija</span>
                  <strong>1.45% M.V.</strong>
                </div>
              </div>

              <div className="summary-details-grid">
                <div className="summary-item">
                  <span className="s-label">Monto Solicitado:</span>
                  <strong className="s-value text-accent">{formatMoney(monto)}</strong>
                </div>
                <div className="summary-item">
                  <span className="s-label">Plazo Elegido:</span>
                  <strong className="s-value">{plazo} meses ({plazo} cuotas)</strong>
                </div>
                <div className="summary-item">
                  <span className="s-label">Cuota Mensual Estimada:</span>
                  <strong className="s-value text-success">{formatMoney(cuotaEstimada)}</strong>
                </div>
                <div className="summary-item">
                  <span className="s-label">Empresa Pagadora:</span>
                  <strong className="s-value">{codigoEmpresa || cliente?.empresa || 'Convenio'}</strong>
                </div>
                <div className="summary-item">
                  <span className="s-label">Solicitante:</span>
                  <strong className="s-value">{primerNombre} {primerApellido}</strong>
                </div>
                <div className="summary-item">
                  <span className="s-label">Documento:</span>
                  <strong className="s-value">{identificacion}</strong>
                </div>
                <div className="summary-item">
                  <span className="s-label">Correo Notificaciones:</span>
                  <strong className="s-value">{correo}</strong>
                </div>
                <div className="summary-item">
                  <span className="s-label">Teléfono:</span>
                  <strong className="s-value">{telefono}</strong>
                </div>
              </div>
            </div>

            {/* Legal Checkboxes */}
            <div className="legal-checkboxes-block">
              <label className="checkbox-custom-row">
                <input
                  type="checkbox"
                  checked={aceptaHabeasData}
                  onChange={(e) => setAceptaHabeasData(e.target.checked)}
                />
                <span>
                  Autorizo el tratamiento de mis datos personales y la consulta ante centrales de información crediticia (TransUnion, Datacrédito) conforme a la <strong>Ley 1581 de 2012</strong>.
                </span>
              </label>

              <label className="checkbox-custom-row">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                />
                <span>
                  He leído y acepto los <strong>términos y condiciones</strong> del servicio de libranza y autorizo el débito por nómina de mi empleador.
                </span>
              </label>
            </div>

            <div className="onboarding-actions-footer">
              <button
                type="button"
                className="btn-secondary-ghost"
                onClick={() => setCurrentStep(cliente && cliente.perfilCompleto ? 1 : 3)}
                disabled={loading}
              >
                ◀ Modificar Datos
              </button>
              <button
                type="button"
                className="portal-btn-primary glow-pulse"
                disabled={loading || !aceptaTerminos || !aceptaHabeasData}
                onClick={handleSubmitApplication}
              >
                {loading ? 'Radicando solicitud...' : 'Confirmar y Enviar Solicitud 🚀'}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: VALIDACIÓN BIOMÉTRICA JUMIO Y ÉXITO ================= */}
        {currentStep === 5 && (
          <div className="onboarding-step-body success-step animate-fadeIn">
            <div className="success-icon-animation">
              {jumioStatus === 'APROBADO' ? <span>🛡️</span> : <span>🎉</span>}
            </div>

            <span className="step-kicker">
              {jumioStatus === 'APROBADO' ? 'IDENTIDAD VALIDADA' : 'PASO FINAL: IDENTIDAD DIGITAL'}
            </span>
            <h2>
              {jumioStatus === 'APROBADO'
                ? '¡Identidad Verificada con Éxito!'
                : '¡Solicitud Radicada! Validación Biométrica'}
            </h2>
            <p className="success-subtitle">
              Hemos registrado tu solicitud con el consecutivo oficial:
            </p>
            <div className="consecutivo-pill-display">
              {consecutivoGenerado}
            </div>

            {/* Tarjeta de Verificación Biométrica Jumio */}
            <div className="jumio-verification-card">
              <div className="jumio-card-header">
                <div className="jumio-brand-badge">
                  <span className="jumio-shield-icon">🛡️</span>
                  <div>
                    <strong>Verificación de Identidad Oficial</strong>
                    <small>Powered by Jumio Identity Cloud</small>
                  </div>
                </div>
                <span className={`jumio-status-badge ${jumioStatus.toLowerCase()}`}>
                  {jumioStatus === 'APROBADO' ? '✓ Biometría Aprobada' : '🟡 Validación Requerida'}
                </span>
              </div>

              {jumioStatus !== 'APROBADO' ? (
                <>
                  <p className="jumio-desc">
                    Para protegerte contra fraude y cumplir la normatividad financiera, Jumio validará tu cédula original y realizará una prueba de vida facial 1:1 en segundos.
                  </p>

                  <div className="jumio-instructions-grid">
                    <div className="jumio-inst-item">
                      <span className="j-step-num">1</span>
                      <div>
                        <strong>Cédula Original</strong>
                        <small>Ten tu documento a la mano para capturar frente y reverso.</small>
                      </div>
                    </div>
                    <div className="jumio-inst-item">
                      <span className="j-step-num">2</span>
                      <div>
                        <strong>Cámara / QR Móvil</strong>
                        <small>Usa tu cámara web o continúa escaneando un QR con tu celular.</small>
                      </div>
                    </div>
                    <div className="jumio-inst-item">
                      <span className="j-step-num">3</span>
                      <div>
                        <strong>Prueba de Vida</strong>
                        <small>Selfie en vivo para verificar vivacidad y coincidencia facial.</small>
                      </div>
                    </div>
                  </div>

                  <div className="jumio-actions-box">
                    <a
                      href={jumioData?.webHref || `http://localhost:5174/?jumio=mock&creditoId=${creditoGeneradoId || 1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-btn-primary glow-pulse jumio-launch-btn"
                    >
                      Iniciar Verificación Biométrica con Jumio ➔
                    </a>

                    <button
                      type="button"
                      className="btn-simulation-demo"
                      disabled={simulatingJumio}
                      onClick={handleSimularJumio}
                      title="Simula la aprobación exitosa del webhook de Jumio para pruebas"
                    >
                      {simulatingJumio ? 'Validando con IA de Jumio...' : '⚡ Simular Aprobación Biométrica (Sandbox Demo)'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="jumio-success-box">
                  <div className="j-success-row">
                    <span>Resultado Biométrico:</span>
                    <strong className="text-success">APROBADO (Coincidencia facial 98.7%)</strong>
                  </div>
                  <div className="j-success-row">
                    <span>Prueba de Vida (Liveness):</span>
                    <strong className="text-success">Válida (Anti-spoofing nivel 2)</strong>
                  </div>
                  <div className="j-success-row">
                    <span>Estado del Crédito:</span>
                    <strong className="text-highlight-amount">AVANZADO A ESTUDIO Y APROBACIÓN</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="success-footer-actions">
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => {
                  onClose();
                  if (onCompletedBiometrics) onCompletedBiometrics();
                  window.location.reload();
                }}
              >
                Ir a Mi Portal de Clientes ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
