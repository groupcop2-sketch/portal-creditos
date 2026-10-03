import React from 'react';

interface HowItWorksSectionProps {
  onStartOnboarding: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartOnboarding }) => {
  const steps = [
    {
      step: '01',
      title: 'Simula tu crédito',
      desc: 'Ajusta el monto y el plazo que necesitas con nuestra calculadora interactiva en tiempo real.',
      icon: '🧮',
      badge: 'Paso 1'
    },
    {
      step: '02',
      title: 'Vincula tu empresa',
      desc: 'Ingresa tus datos básicos y el código de convenio de tu empleador para autorizar el descuento por nómina.',
      icon: '🏢',
      badge: 'Paso 2'
    },
    {
      step: '03',
      title: 'Firma con DocuSign',
      desc: 'Recibe tu contrato y pagaré en tu correo electrónico. Firma digitalmente desde cualquier dispositivo con total validez legal.',
      icon: '✍️',
      badge: 'Paso 3'
    },
    {
      step: '04',
      title: 'Desembolso en tu cuenta',
      desc: 'Una vez validada la firma, el dinero se transfiere directamente a tu cuenta bancaria de nómina en tiempo récord.',
      icon: '🚀',
      badge: 'Paso 4'
    }
  ];

  return (
    <section className="how-it-works-section" id="como-funciona">
      <div className="section-container">
        <div className="section-header-center">
          <span className="section-badge-pill">PROCESO 100% DIGITAL</span>
          <h2 className="section-title">¿Cómo solicitar tu crédito?</h2>
          <p className="section-subtitle">
            Sin filas, sin papeleos interminables y sin desplazarte. Todo el trámite
            se realiza en línea desde tu celular o computadora.
          </p>
        </div>

        <div className="steps-cards-grid">
          {steps.map((item, index) => (
            <div key={item.step} className="step-card">
              <div className="step-card-header">
                <span className="step-number-tag">{item.step}</span>
                <span className="step-icon-emoji">{item.icon}</span>
              </div>
              <h3 className="step-card-title">{item.title}</h3>
              <p className="step-card-desc">{item.desc}</p>
              <div className="step-card-footer">
                <span className="step-status-chip">{item.badge}</span>
                {index < steps.length - 1 && (
                  <span className="step-arrow-indicator">➔</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="how-it-works-cta-box">
          <div className="cta-box-text">
            <h3>¿Listo para recibir tu crédito?</h3>
            <p>Empieza ahora mismo y obtén respuesta en minutos.</p>
          </div>
          <button
            type="button"
            className="portal-btn-primary glow-pulse"
            onClick={onStartOnboarding}
          >
            Iniciar Solicitud Ahora ➔
          </button>
        </div>
      </div>
    </section>
  );
};
