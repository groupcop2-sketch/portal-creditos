import React from 'react';
import { ShieldCheck, Lock, Award, HeartHandshake, Phone, Mail, Clock, HelpCircle, FileText } from 'lucide-react';

interface PortalFooterProps {
  onOpenSimulador?: () => void;
  onOpenRequisitos?: () => void;
  onOpenPreguntas?: () => void;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({
  onOpenSimulador,
  onOpenRequisitos,
  onOpenPreguntas
}) => {
  return (
    <footer className="portal-footer">
      {/* Top Trust Banner */}
      <div className="portal-footer-trust-banner">
        <div className="portal-container">
          <div className="portal-trust-grid">
            <div className="portal-trust-item">
              <div className="portal-trust-icon-box">
                <ShieldCheck size={24} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="portal-trust-title">100% Legal & Regulado</h4>
                <p className="portal-trust-desc">Cumplimiento estricto Ley 1527 de Libranzas y Ley 1581 Habeas Data.</p>
              </div>
            </div>

            <div className="portal-trust-item">
              <div className="portal-trust-icon-box">
                <Lock size={24} className="text-cyan-400" />
              </div>
              <div>
                <h4 className="portal-trust-title">Seguridad Bancaria 256-bit</h4>
                <p className="portal-trust-desc">Tus datos personales y financieros están cifrados con estándares AES-256.</p>
              </div>
            </div>

            <div className="portal-trust-item">
              <div className="portal-trust-icon-box">
                <Award size={24} className="text-amber-400" />
              </div>
              <div>
                <h4 className="portal-trust-title">Firma Digital Válida</h4>
                <p className="portal-trust-desc">Convenio y pagaré desmaterializado con validez jurídica probatoria.</p>
              </div>
            </div>

            <div className="portal-trust-item">
              <div className="portal-trust-icon-box">
                <HeartHandshake size={24} className="text-indigo-400" />
              </div>
              <div>
                <h4 className="portal-trust-title">Sin Costos Ocultos</h4>
                <p className="portal-trust-desc">Tasa fija en pesos, simulación transparente desde el primer minuto.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="portal-footer-main">
        <div className="portal-container">
          <div className="portal-footer-cols">
            {/* Col 1: Brand Info */}
            <div className="portal-footer-col brand-col">
              <div className="portal-brand" style={{ marginBottom: '16px' }}>
                <div className="portal-logo-icon">
                  <span className="portal-logo-glow"></span>
                  <Award size={22} className="portal-logo-symbol" />
                </div>
                <div>
                  <div className="portal-logo-text">CrediYa</div>
                  <div className="portal-logo-sub">PORTAL DE CRÉDITOS DIGITAL</div>
                </div>
              </div>
              <p className="portal-footer-bio">
                La plataforma líder de originación digital de crédito por libranza y libre inversión para empleados del sector público y privado con convenios activos. Rápido, seguro y sin filas.
              </p>
              <div className="portal-footer-compliance-badges">
                <span className="compliance-tag"><Lock size={12} /> SSL EV Secure</span>
                <span className="compliance-tag"><ShieldCheck size={12} /> DocuSign Ready</span>
                <span className="compliance-tag"><Award size={12} /> Vigilado</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="portal-footer-col">
              <h5 className="portal-footer-heading">Navegación</h5>
              <ul className="portal-footer-list">
                <li><a href="#simulador" onClick={(e) => { e.preventDefault(); onOpenSimulador?.(); }}>Simulador de Crédito</a></li>
                <li><a href="#como-funciona">¿Cómo Funciona?</a></li>
                <li><a href="#beneficios">Ventajas & Beneficios</a></li>
                <li><a href="#requisitos" onClick={(e) => { e.preventDefault(); onOpenRequisitos?.(); }}>Requisitos para Postular</a></li>
                <li><a href="#faq" onClick={(e) => { e.preventDefault(); onOpenPreguntas?.(); }}>Preguntas Frecuentes</a></li>
              </ul>
            </div>

            {/* Col 3: Legal & Transparencia */}
            <div className="portal-footer-col">
              <h5 className="portal-footer-heading">Transparencia</h5>
              <ul className="portal-footer-list">
                <li><a href="#terminos" onClick={(e) => e.preventDefault()}><FileText size={14} /> Términos y Condiciones</a></li>
                <li><a href="#privacidad" onClick={(e) => e.preventDefault()}><ShieldCheck size={14} /> Política de Tratamiento de Datos</a></li>
                <li><a href="#tasas" onClick={(e) => e.preventDefault()}><Award size={14} /> Tasas de Interés y Tarifas</a></li>
                <li><a href="#libranzas" onClick={(e) => e.preventDefault()}><Lock size={14} /> Marco Legal Ley 1527 Libranzas</a></li>
                <li><a href="#pqrs" onClick={(e) => e.preventDefault()}><HelpCircle size={14} /> Radicación de PQRS</a></li>
              </ul>
            </div>

            {/* Col 4: Contact & Support */}
            <div className="portal-footer-col">
              <h5 className="portal-footer-heading">Atención al Cliente</h5>
              <ul className="portal-footer-contact-list">
                <li>
                  <Phone size={16} className="text-cyan-400" />
                  <div>
                    <span className="contact-label">Línea Nacional Gratuita</span>
                    <span className="contact-val">01 8000 910 200</span>
                  </div>
                </li>
                <li>
                  <Mail size={16} className="text-cyan-400" />
                  <div>
                    <span className="contact-label">Soporte y Radicaciones</span>
                    <span className="contact-val">solicitudes@creditos-portal.co</span>
                  </div>
                </li>
                <li>
                  <Clock size={16} className="text-cyan-400" />
                  <div>
                    <span className="contact-label">Horario de Validación</span>
                    <span className="contact-val">Lunes a Viernes: 7:30 AM - 6:00 PM<br />Sábados: 8:00 AM - 1:00 PM</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="portal-footer-bottom">
            <div className="portal-footer-copy">
              © {new Date().getFullYear()} CrediYa Soluciones Financieras S.A.S. Todos los derechos reservados.
            </div>
            <div className="portal-footer-legal-micro">
              * La tasa de interés otorgada dependerá del convenio empleador, capacidad de endeudamiento del solicitante y perfil crediticio validado ante operadores de información. El desembolso se realiza a la cuenta bancaria de nómina certificada una vez confirmada la visación de la pagaduría.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
