import React, { useState } from 'react';
import { DiditSdk } from '@didit-protocol/sdk-web';
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../../api';

interface DiditVerifyButtonProps {
  creditoId: number;
  token?: string | null;
  onSuccess?: () => void;
  className?: string;
}

export const DiditVerifyButton: React.FC<DiditVerifyButtonProps> = ({
  creditoId,
  token,
  onSuccess,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const effectiveToken = token || localStorage.getItem('portal_token') || '';

  const handleStartVerification = async () => {
    setError(null);
    setLoading(true);
    setShowConsentModal(false);

    try {
      const res = await api.iniciarVerificacionDidit(effectiveToken, creditoId);
      if (!res?.url) {
        throw new Error('No se recibió la URL de verificación de Didit');
      }

      // Configure SDK completion callback (UI hint only; webhook is source of truth)
      DiditSdk.shared.onComplete = (result) => {
        const resultType = result?.type || (result as any)?.status || 'completed';
        setLastStatus(resultType);
        if (resultType === 'completed') {
          if (onSuccess) {
            onSuccess();
          }
        }
      };

      // Open verification modal
      DiditSdk.shared.startVerification({ url: res.url });
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar la verificación de identidad con Didit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`didit-verify-container ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => setShowConsentModal(true)}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 18px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Iniciando Didit KYC...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            <span>Verificar mi identidad con Didit</span>
          </>
        )}
      </button>

      {/* Error Feedback */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#dc2626',
            fontSize: '12px',
            background: '#fef2f2',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #fecaca'
          }}
        >
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Completion feedback */}
      {lastStatus && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: lastStatus === 'completed' ? '#15803d' : '#854d0e',
            fontSize: '12px',
            background: lastStatus === 'completed' ? '#f0fdf4' : '#fefce8',
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${lastStatus === 'completed' ? '#bbf7d0' : '#fef08a'}`
          }}
        >
          <CheckCircle2 size={15} />
          <span>
            {lastStatus === 'completed'
              ? 'Proceso de verificación completado. El resultado se está procesando vía Webhook.'
              : `Estado del flujo: ${lastStatus}`}
          </span>
        </div>
      )}

      {/* Mandatory User-Facing Disclosure / Consent Modal */}
      {showConsentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              color: '#1e293b'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7'
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  Consentimiento de Verificación de Identidad
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Tecnología provista por Didit Protocol</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#475569', marginBottom: '14px' }}>
              Para procesar tu solicitud de crédito de forma segura y cumplir con la regulación financiera, realizaremos
              una verificación biométrica y validación de tu documento de identidad mediante <strong>Didit KYC</strong>.
            </p>

            <ul style={{ margin: '0 0 16px 0', paddingLeft: '18px', fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>
              <li>Captura de tu cédula o documento de identidad original.</li>
              <li>Prueba de vida facial (selfie biométrico) para validar autenticidad.</li>
              <li>Tus datos biométricos se cifran y procesan bajo estrictos estándares de privacidad.</li>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                style={{
                  padding: '9px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartVerification}
                style={{
                  padding: '9px 18px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Aceptar y Continuar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
