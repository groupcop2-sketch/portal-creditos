import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface BenefitsSectionProps {
  onStartOnboarding?: () => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onStartOnboarding }) => {
  const benefits = [
    {
      title: '100% Digital y Sin Papeleos',
      desc: 'Olvídate de imprimir formularios, autenticar documentos en notaría o esperar turnos. Todo se gestiona en línea desde tu celular o computador.',
      icon: '📱',
      tag: 'Agilidad',
      highlight: true
    },
    {
      title: 'Descuento Cómodo por Nómina',
      desc: 'La cuota fija mensual se descuenta automáticamente de tu sueldo. Nunca más te preocuparás por olvidar una fecha de pago o generar moras.',
      icon: '💳',
      tag: 'Tranquilidad'
    },
    {
      title: 'Tasas de Interés Preferenciales',
      desc: 'Gracias a los convenios corporativos con tu empresa, disfrutas de tasas de interés sustancialmente menores a las de tarjetas de crédito.',
      icon: '📉',
      tag: 'Ahorro',
      highlight: true
    },
    {
      title: 'Firma Legal con DocuSign',
      desc: 'Pagarés y contratos respaldados por la plataforma líder mundial en firma electrónica con plena validez jurídica según la Ley 527 de Colombia.',
      icon: '🛡️',
      tag: 'Seguridad'
    },
    {
      title: 'Desembolso en Tiempo Récord',
      desc: 'Aprobamos tu crédito en minutos y transferimos los recursos a tu cuenta de nómina en menos de 24 horas hábiles tras la visación.',
      icon: '⚡',
      tag: 'Inmediatez'
    },
    {
      title: 'Transparencia Total',
      desc: 'Cero cobros ocultos o letra chica. Conoces desde el primer segundo tu cuota exacta, intereses y el valor total a cancelar.',
      icon: '✨',
      tag: 'Confianza'
    }
  ];

  return (
    <section className="portal-section portal-section-benefits" id="beneficios">
      <div className="portal-container">
        <div className="portal-section-header">
          <span className="portal-badge-pill">¿POR QUÉ ELEGIRNOS?</span>
          <h2 className="portal-section-title">Diseñado para tu bienestar financiero</h2>
          <p className="portal-section-desc">
            Unimos tecnología y convenios corporativos para que alcances tus metas con
            la mayor tranquilidad y las mejores condiciones del mercado.
          </p>
        </div>

        <div className="benefits-bento-grid">
          {benefits.map((b) => (
            <div
              key={b.title}
              className={`bento-card ${b.highlight ? 'bento-card-large' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="bento-icon-wrapper" style={{ fontSize: '1.5rem' }}>{b.icon}</span>
                <span className="bento-badge">{b.tag}</span>
              </div>
              <h3 className="bento-title">{b.title}</h3>
              <p className="bento-desc">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* High-impact CTA banner */}
        <div className="benefits-cta-banner">
          <div className="benefits-cta-content">
            <h4>¿Listo para obtener tu crédito hoy mismo?</h4>
            <p>Simula tu monto, postúlate en 3 minutos y recibe el dinero en tu cuenta bancaria de nómina.</p>
          </div>
          {onStartOnboarding && (
            <button
              type="button"
              className="portal-btn-cta"
              onClick={onStartOnboarding}
              style={{ minWidth: '220px' }}
            >
              <span className="portal-btn-cta-shimmer"></span>
              <Zap size={20} />
              Solicitar Crédito Ya
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
