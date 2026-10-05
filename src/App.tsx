import React, { useState, useEffect, useCallback } from 'react';
import {
  api,
  type PortalCatalogs,
  type PortalCliente,
  type PortalCreditosResponse,
  type PortalProductoCredito
} from './api';
import { PortalHeader } from './components/portal/PortalHeader';
import { PortalHero } from './components/portal/PortalHero';
import { HowItWorksSection } from './components/portal/HowItWorksSection';
import { BenefitsSection } from './components/portal/BenefitsSection';
import { PortalFooter } from './components/portal/PortalFooter';
import { OnboardingModal, type OnboardingInitialData } from './components/portal/OnboardingModal';
import { AuthModal } from './components/portal/AuthModal';
import { ClientDashboard } from './components/portal/ClientDashboard';

export default function App() {
  // Theme state
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('portal_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('portal_theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Auth & Client State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('portal_client_token'));
  const [cliente, setCliente] = useState<PortalCliente | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Data State
  const [catalogs, setCatalogs] = useState<PortalCatalogs>({
    tiposIdentificacion: [
      { id: 1, sigla: 'CC', descripcion: 'Cédula de Ciudadanía', codigoDane: '1' },
      { id: 2, sigla: 'CE', descripcion: 'Cédula de Extranjería', codigoDane: '2' },
      { id: 3, sigla: 'PA', descripcion: 'Pasaporte', codigoDane: '3' }
    ],
    tiposContrato: [
      { id: 1, nombre: 'Término Indefinido' },
      { id: 2, nombre: 'Término Fijo' },
      { id: 3, nombre: 'Obra o Labor' },
      { id: 4, nombre: 'Carrera Administrativa / Propiedad' },
      { id: 5, nombre: 'Provisionalidad' },
      { id: 6, nombre: 'Pensionado / Jubilado' }
    ],
    cargos: [
      { id: 1, nombre: 'Abogado' },
      { id: 2, nombre: 'Account Manager' },
      { id: 3, nombre: 'Administrador' },
      { id: 4, nombre: 'Analista' },
      { id: 5, nombre: 'Analista de Calidad' },
      { id: 6, nombre: 'Analista de Crédito' },
      { id: 7, nombre: 'Analista de Nómina' },
      { id: 8, nombre: 'Analista Financiero' },
      { id: 9, nombre: 'Analista Operativo' },
      { id: 10, nombre: 'Asesor Comercial' },
      { id: 11, nombre: 'Asesor Jurídico' },
      { id: 12, nombre: 'Asistente Administrativo' },
      { id: 13, nombre: 'Asistente Operativo' },
      { id: 14, nombre: 'Auxiliar Contable' },
      { id: 15, nombre: 'Auxiliar de Bodega' },
      { id: 16, nombre: 'Auxiliar Operativo' },
      { id: 17, nombre: 'Comercial' },
      { id: 18, nombre: 'Contador' },
      { id: 19, nombre: 'Coordinador' },
      { id: 20, nombre: 'Director Administrativo' },
      { id: 21, nombre: 'Director Ejecutivo' },
      { id: 22, nombre: 'Docente / Profesor' },
      { id: 23, nombre: 'Empleado' },
      { id: 24, nombre: 'Especialista' },
      { id: 25, nombre: 'Gerente' },
      { id: 26, nombre: 'Gerente General' },
      { id: 27, nombre: 'Gerente Recursos Humanos' },
      { id: 28, nombre: 'Ingeniero' },
      { id: 29, nombre: 'Ingeniero Civil' },
      { id: 30, nombre: 'Ingeniero de Sistemas' },
      { id: 31, nombre: 'Jefe de Operaciones' },
      { id: 32, nombre: 'Mecánico' },
      { id: 33, nombre: 'Mecánico de Llantas' },
      { id: 34, nombre: 'Mecánico OTR' },
      { id: 35, nombre: 'Médico' },
      { id: 36, nombre: 'Mensajero' },
      { id: 37, nombre: 'Operador' },
      { id: 38, nombre: 'Operario' },
      { id: 39, nombre: 'Pensionado / Jubilado' },
      { id: 40, nombre: 'Recepcionista' },
      { id: 41, nombre: 'RTC' },
      { id: 42, nombre: 'Secretaria' },
      { id: 43, nombre: 'Servicios Generales' },
      { id: 44, nombre: 'Supervisor' },
      { id: 45, nombre: 'Técnico' },
      { id: 46, nombre: 'Técnico de Mantenimiento' },
      { id: 47, nombre: 'Técnico Mecánico' },
      { id: 48, nombre: 'Tesorero' },
      { id: 49, nombre: 'Vendedor' }
    ]
  });

  const [productos, setProductos] = useState<PortalProductoCredito[]>([
    {
      id: 1,
      nombre: 'Libranza Libre Inversión Digital',
      descripcion: 'Crédito con descuento directo por nómina con la mejor tasa preferencial.',
      montoMinimo: 1000000,
      montoMaximo: 60000000,
      plazoMinimo: 6,
      plazoMaximo: 72,
      tipoTasa: 'FIJA',
      tipoCredito: 'LIBRANZA',
      tasaMensual: 0.0145
    },
    {
      id: 2,
      nombre: 'Compra de Cartera por Nómina',
      descripcion: 'Unifica tus deudas de tarjetas y créditos con tasa preferencial y cuota única reducida.',
      montoMinimo: 3000000,
      montoMaximo: 100000000,
      plazoMinimo: 12,
      plazoMaximo: 84,
      tipoTasa: 'FIJA',
      tipoCredito: 'COMPRA_CARTERA',
      tasaMensual: 0.0125
    },
    {
      id: 3,
      nombre: 'Crédito Educativo & Salud',
      descripcion: 'Financia tus estudios de pregrado, posgrado o tratamientos médicos prioritarios.',
      montoMinimo: 1000000,
      montoMaximo: 30000000,
      plazoMinimo: 6,
      plazoMaximo: 36,
      tipoTasa: 'FIJA',
      tipoCredito: 'ESPECIAL',
      tasaMensual: 0.0115
    }
  ]);

  const [creditosData, setCreditosData] = useState<PortalCreditosResponse>({
    resumen: { activos: 0, solicitados: 0, aprobados: 0, rechazados: 0 },
    creditos: []
  });

  // UI View state
  const [activeView, setActiveView] = useState<'landing' | 'dashboard'>('landing');

  // Modal states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingInitialData, setOnboardingInitialData] = useState<OnboardingInitialData>({
    monto: 10000000,
    plazo: 24,
    idProductoCredito: 1,
    productoNombre: 'Libranza Libre Inversión Digital'
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'registro' | 'forgot'>('login');

  // Currency Formatter
  const formatMoney = (val?: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return '$ 0';
    return `$ ${Math.round(val).toLocaleString('es-CO')}`;
  };

  // Initial Catalogs & Products loading
  useEffect(() => {
    const loadCatalogsAndProducts = async () => {
      try {
        const catRes = await api.listPortalCatalogs();
        if (catRes) {
          setCatalogs((prev) => ({
            tiposIdentificacion: catRes.tiposIdentificacion?.length ? catRes.tiposIdentificacion : prev.tiposIdentificacion,
            tiposContrato: catRes.tiposContrato?.length ? catRes.tiposContrato : prev.tiposContrato,
            empresas: catRes.empresas?.length ? catRes.empresas : prev.empresas,
            cargos: catRes.cargos?.length ? catRes.cargos : prev.cargos
          }));
        }
      } catch (err) {
        console.warn('Usando catálogos predeterminados:', err);
      }

      try {
        const prodRes = await api.listPortalProductos(token || '');
        if (Array.isArray(prodRes) && prodRes.length > 0) {
          setProductos(prodRes);
        }
      } catch (err) {
        console.warn('Usando productos predeterminados:', err);
      }
    };

    loadCatalogsAndProducts();
  }, [token]);

  // Load Client Data & Creditos if token exists
  const loadClientSession = useCallback(async (authToken: string) => {
    setLoadingAuth(true);
    try {
      const me = await api.mePortal(authToken);
      setCliente(me);

      const creds = await api.listPortalCreditos(authToken);
      if (creds) {
        setCreditosData(creds);
      }
      setActiveView('dashboard');
    } catch (err) {
      console.error('Error cargando sesión de cliente:', err);
      localStorage.removeItem('portal_client_token');
      setToken(null);
      setCliente(null);
      setActiveView('landing');
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadClientSession(token);
    } else {
      setLoadingAuth(false);
    }
  }, [token, loadClientSession]);

  // Handler: Open Onboarding from simulator or CTA
  const handleStartOnboarding = (data: {
    monto: number;
    plazo: number;
    idProductoCredito?: number;
    productoNombre?: string;
  }) => {
    setOnboardingInitialData({
      monto: data.monto,
      plazo: data.plazo,
      idProductoCredito: data.idProductoCredito || productos[0]?.id || 1,
      productoNombre: data.productoNombre || productos[0]?.nombre || 'Libranza Libre Inversión'
    });
    setIsOnboardingOpen(true);
  };

  // Handler: Open Auth Modal
  const handleOpenAuth = (mode: 'login' | 'registro' | 'forgot' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  // Handler: Login client
  const handleLoginClient = async (identificacion: string, password: string): Promise<boolean> => {
    try {
      const res = await api.loginPortalClient(identificacion, password);
      if (res && res.token) {
        localStorage.setItem('portal_client_token', res.token);
        setToken(res.token);
        setCliente(res.cliente);
        setIsAuthOpen(false);
        setIsOnboardingOpen(false);

        // Load creditos
        try {
          const creds = await api.listPortalCreditos(res.token);
          if (creds) setCreditosData(creds);
        } catch {}

        setActiveView('dashboard');
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  // Handler: Register client from AuthModal
  const handleRegisterClient = async (formData: any): Promise<boolean> => {
    try {
      const res = await api.registerPortalClient(formData);
      if (res && res.token) {
        localStorage.setItem('portal_client_token', res.token);
        setToken(res.token);
        setCliente(res.cliente);
        setIsAuthOpen(false);
        setActiveView('dashboard');
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarte');
    }
  };

  // Handler: Forgot password
  const handleForgotPassword = async (correo: string): Promise<boolean> => {
    try {
      await api.forgotPortalPassword(correo);
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Error al solicitar recuperación');
    }
  };

  // Handler: Logout
  const handleLogout = () => {
    localStorage.removeItem('portal_client_token');
    setToken(null);
    setCliente(null);
    setCreditosData({
      resumen: { activos: 0, solicitados: 0, aprobados: 0, rechazados: 0 },
      creditos: []
    });
    setActiveView('landing');
  };

  // Handler: Complete labor profile in Dashboard
  const handleCompleteLaborProfile = async (laborData: any): Promise<boolean> => {
    if (!token) return false;
    try {
      const updated = await api.completePortalLaborProfile(token, laborData);
      setCliente(updated);
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'No se pudo actualizar el perfil laboral');
    }
  };

  // Handler: Submit Onboarding application (with registration if needed)
  const handleRegisterAndSubmitOnboarding = async (formData: any): Promise<{
    success: boolean;
    consecutivo?: string;
    creditoId?: number;
    jumio?: any;
    error?: string;
  }> => {
    try {
      let activeAuthToken = token;

      // If user is not yet logged in, register first or login
      if (!activeAuthToken) {
        const regRes = await api.registerPortalClient({
          codigoEmpresa: formData.codigoEmpresa || 'GENERAL',
          identificacion: formData.identificacion,
          primerNombre: formData.primerNombre,
          segundoNombre: formData.segundoNombre || '',
          primerApellido: formData.primerApellido,
          segundoApellido: formData.segundoApellido || '',
          correo: formData.correo,
          telefono: formData.telefono,
          password: formData.password || `${formData.identificacion}*2026`,
          cargo: formData.cargo || 'Funcionario',
          idTipoContrato: formData.idTipoContrato || '1',
          fechaIngreso: formData.fechaIngreso || new Date().toISOString().slice(0, 10),
          salario: formData.salario || '3500000',
          neto: formData.neto || formData.salario || '3000000',
          tieneEmbargos: Boolean(formData.tieneEmbargos),
          idTipoIdentificacion: formData.idTipoIdentificacion || '1'
        });

        if (regRes && regRes.token) {
          activeAuthToken = regRes.token;
          localStorage.setItem('portal_client_token', regRes.token);
          setToken(regRes.token);
          setCliente(regRes.cliente);
        } else {
          throw new Error('No se pudo completar el registro de usuario');
        }
      }

      // Always save/complete labor profile with data from Step 3 before submitting
      if (formData.codigoEmpresa && activeAuthToken) {
        try {
          const updatedCli = await api.completePortalLaborProfile(activeAuthToken, {
            codigoEmpresa: formData.codigoEmpresa,
            cargo: formData.cargo || 'Funcionario',
            idTipoContrato: Number(formData.idTipoContrato || 1),
            fechaIngreso: formData.fechaIngreso || new Date().toISOString().slice(0, 10),
            salario: Number(formData.salario || 3000000),
            neto: Number(formData.neto || formData.salario || 2500000),
            tieneEmbargos: Boolean(formData.tieneEmbargos)
          });
          if (updatedCli) setCliente(updatedCli);
        } catch (labErr: any) {
          console.warn('Error actualizando perfil laboral en onboarding:', labErr.message);
        }
      }

      // Now create credit request with correct montoSolicitado
      const creditRes = await api.crearSolicitudPortal(activeAuthToken, {
        idProductoCredito: Number(formData.idProductoCredito),
        montoSolicitado: Number(formData.montoSolicitado || formData.monto),
        plazo: Number(formData.plazo),
        codigoVendedor: formData.codigoVendedor || '',
        aceptaTerminos: true
      });

      // Refresh creditos list
      try {
        const updatedCreds = await api.listPortalCreditos(activeAuthToken);
        if (updatedCreds) setCreditosData(updatedCreds);
      } catch {}

      const numCredito = creditRes.consecutivo || (creditRes as any).numeroCredito || `CR-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      return {
        success: true,
        consecutivo: String(numCredito),
        creditoId: creditRes.id,
        jumio: creditRes.jumio
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Error al procesar la solicitud de crédito'
      };
    }
  };

  return (
    <div className="portal-app-root">
      {/* Header */}
      <PortalHeader
        cliente={cliente}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
        onOpenOnboarding={() =>
          handleStartOnboarding({
            monto: 10000000,
            plazo: 24,
            idProductoCredito: productos[0]?.id || 1,
            productoNombre: productos[0]?.nombre || 'Libranza Libre Inversión'
          })
        }
        onLogout={handleLogout}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        activeView={activeView}
        onNavigateView={(view) => setActiveView(view)}
      />

      {/* Main Content Body */}
      <main className="portal-main-wrapper">
        {activeView === 'landing' ? (
          <>
            <PortalHero
              productos={productos}
              onStartOnboarding={handleStartOnboarding}
              formatMoney={formatMoney}
            />
            <HowItWorksSection
              onStartOnboarding={() =>
                handleStartOnboarding({
                  monto: 10000000,
                  plazo: 24,
                  idProductoCredito: productos[0]?.id || 1,
                  productoNombre: productos[0]?.nombre || 'Libranza Libre Inversión'
                })
              }
            />
            <BenefitsSection
              onStartOnboarding={() =>
                handleStartOnboarding({
                  monto: 15000000,
                  plazo: 36,
                  idProductoCredito: productos[0]?.id || 1,
                  productoNombre: productos[0]?.nombre || 'Libranza Libre Inversión'
                })
              }
            />
          </>
        ) : (
          cliente && (
            <ClientDashboard
              cliente={cliente}
              creditosData={creditosData}
              productos={productos}
              catalogs={catalogs}
              token={token}
              onRefreshSession={() => {
                if (token) loadClientSession(token);
              }}
              onOpenNewCredit={() =>
                handleStartOnboarding({
                  monto: 10000000,
                  plazo: 24,
                  idProductoCredito: productos[0]?.id || 1,
                  productoNombre: productos[0]?.nombre || 'Libranza Libre Inversión'
                })
              }
              onCompleteLaborProfile={handleCompleteLaborProfile}
              formatMoney={formatMoney}
            />
          )
        )}
      </main>

      {/* Footer */}
      <PortalFooter
        onOpenSimulador={() => {
          setActiveView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenRequisitos={() => {
          setActiveView('landing');
          const el = document.getElementById('como-funciona');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenPreguntas={() => {
          setActiveView('landing');
          const el = document.getElementById('beneficios');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialData={onboardingInitialData}
        catalogs={catalogs}
        productos={productos}
        cliente={cliente}
        token={token}
        onRegisterAndSubmit={handleRegisterAndSubmitOnboarding}
        onLoginClient={handleLoginClient}
        onSwitchToLogin={() => {
          setIsOnboardingOpen(false);
          handleOpenAuth('login');
        }}
        formatMoney={formatMoney}
        onCompletedBiometrics={() => {
          if (token) loadClientSession(token);
        }}
      />

      {/* Auth Modal (Login / Registro / Forgot) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        catalogs={catalogs}
        onLogin={handleLoginClient}
        onRegister={handleRegisterClient}
        onForgotPassword={handleForgotPassword}
      />
    </div>
  );
}
