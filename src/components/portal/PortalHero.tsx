import React, { useState, useMemo } from 'react';
import type { PortalProductoCredito } from '../../api';

interface PortalHeroProps {
  productos: PortalProductoCredito[];
  onStartOnboarding: (data: {
    monto: number;
    plazo: number;
    idProductoCredito?: number;
    productoNombre?: string;
  }) => void;
  formatMoney: (val?: number | null) => string;
}

export const PortalHero: React.FC<PortalHeroProps> = ({
  productos,
  onStartOnboarding,
  formatMoney
}) => {
  // Simulator state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [monto, setMonto] = useState<number>(10000000);
  const [plazo, setPlazo] = useState<number>(24);

  // Active product
  const activeProduct = useMemo(() => {
    if (selectedProductId && productos.length > 0) {
      return productos.find((p) => p.id === selectedProductId) || productos[0];
    }
    return productos[0] || null;
  }, [productos, selectedProductId]);

  // Dynamic limits based on selected product
  const minMonto = activeProduct?.montoMinimo || 1000000;
  const maxMonto = activeProduct?.montoMaximo || 50000000;
  const minPlazo = activeProduct?.plazoMinimo || 6;
  const maxPlazo = activeProduct?.plazoMaximo || 60;

  // Monthly rate (typical 1.45% M.V. or from product)
  const tasaMensual = 0.0145; // 1.45% mensual
  const tasaFianza = 0.002;  // 0.2% fianza/seguro mensual

  // Financial amortization formula
  const cuotaCalculada = useMemo(() => {
    const P = monto;
    const r = tasaMensual;
    const n = plazo;
    if (n <= 0 || P <= 0) return 0;
    // Standard loan annuity formula: P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
    const cuotaBase = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const seguroCuota = P * tasaFianza;
    return Math.round(cuotaBase + seguroCuota);
  }, [monto, plazo]);

  const quickAmounts = [2000000, 5000000, 10000000, 20000000, 35000000, 50000000];
  const quickMonths = [12, 24, 36, 48, 60];

  const handleApply = () => {
    onStartOnboarding({
      monto,
      plazo,
      idProductoCredito: activeProduct?.id,
      productoNombre: activeProduct?.nombre || 'Libranza Libre Inversión'
    });
  };

  return (
    <section className="portal-hero" id="simulador">
      {/* Background glowing animated orbs */}
      <div className="hero-orb orb-primary" />
      <div className="hero-orb orb-accent" />
      <div className="hero-orb orb-cyan" />

      <div className="portal-hero-container">
        {/* Left Column: Headline, Trust Badges, Value Proposition */}
        <div className="hero-left-column">
          <div className="hero-trust-tag">
            <span className="trust-pulse" />
            <span>Convenios con más de 120 empresas en Colombia</span>
          </div>

          <h1 className="hero-main-title">
            Tu crédito por libranza{' '}
            <span className="text-gradient">fácil, rápido</span> y 100% digital.
          </h1>

          <p className="hero-description">
            Simula tu cuota en segundos, vincula tu empresa y recibe tu dinero directamente
            en tu cuenta bancaria sin filas, papeleos físicos ni costos ocultos.
          </p>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <div className="feature-icon-badge">⚡</div>
              <div>
                <strong>Aprobación en minutos</strong>
                <p>Estudio de crédito ágil y respuesta inmediata</p>
              </div>
            </div>
            <div className="hero-feature-item">
              <div className="feature-icon-badge">🔒</div>
              <div>
                <strong>Firma electrónica DocuSign</strong>
                <p>Firma tus pagarés desde tu teléfono con validez legal</p>
              </div>
            </div>
            <div className="hero-feature-item">
              <div className="feature-icon-badge">💼</div>
              <div>
                <strong>Descuento por nómina</strong>
                <p>Cuotas cómodas fijas descontadas de tu pago quincenal o mensual</p>
              </div>
            </div>
          </div>

          <div className="hero-social-proof">
            <div className="avatars-cluster">
              <span className="avatar-chip a1">JP</span>
              <span className="avatar-chip a2">MC</span>
              <span className="avatar-chip a3">LR</span>
              <span className="avatar-chip a4">+5k</span>
            </div>
            <div className="proof-text">
              <div className="rating-stars">★★★★★ 4.9/5</div>
              <span>Más de 5.000 clientes ya disfrutan de su crédito</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Credit Simulator Card */}
        <div className="hero-right-column">
          <div className="simulator-glass-card">
            <div className="simulator-header">
              <div className="simulator-title-group">
                <span className="simulator-tag">SIMULADOR EN VIVO</span>
                <h3>Configura tu préstamo</h3>
              </div>
              <div className="simulator-badge-tasa">
                <span>Tasa fija</span>
                <strong>1.45% M.V.</strong>
              </div>
            </div>

            {/* Product Selector */}
            {productos.length > 1 && (
              <div className="simulator-field-group">
                <label className="simulator-label">Línea de crédito:</label>
                <div className="product-pills-row">
                  {productos.slice(0, 3).map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      className={`product-pill-btn ${(activeProduct?.id === prod.id) ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedProductId(prod.id);
                        if (monto < (prod.montoMinimo || 1000000)) setMonto(prod.montoMinimo || 1000000);
                        if (monto > (prod.montoMaximo || 50000000)) setMonto(prod.montoMaximo || 50000000);
                      }}
                    >
                      {prod.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Amount Configuration */}
            <div className="simulator-field-group">
              <div className="simulator-label-row">
                <label className="simulator-label">¿Cuánto dinero necesitas?</label>
                <span className="simulator-val-display">{formatMoney(monto)}</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                className="simulator-slider"
                min={minMonto}
                max={maxMonto}
                step={500000}
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
              />

              <div className="simulator-slider-bounds">
                <span>{formatMoney(minMonto)}</span>
                <span>{formatMoney(maxMonto)}</span>
              </div>

              {/* Quick Amount Chips */}
              <div className="quick-chips-row">
                {quickAmounts
                  .filter((a) => a >= minMonto && a <= maxMonto)
                  .map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`quick-chip ${monto === amt ? 'active' : ''}`}
                      onClick={() => setMonto(amt)}
                    >
                      ${amt / 1000000}M
                    </button>
                  ))}
              </div>
            </div>

            {/* Term Configuration */}
            <div className="simulator-field-group">
              <div className="simulator-label-row">
                <label className="simulator-label">¿A cuántos meses deseas pagarlo?</label>
                <span className="simulator-val-display">{plazo} meses</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                className="simulator-slider"
                min={minPlazo}
                max={maxPlazo}
                step={6}
                value={plazo}
                onChange={(e) => setPlazo(Number(e.target.value))}
              />

              <div className="simulator-slider-bounds">
                <span>{minPlazo} meses</span>
                <span>{maxPlazo} meses</span>
              </div>

              {/* Quick Months Chips */}
              <div className="quick-chips-row">
                {quickMonths
                  .filter((m) => m >= minPlazo && m <= maxPlazo)
                  .map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`quick-chip ${plazo === m ? 'active' : ''}`}
                      onClick={() => setPlazo(m)}
                    >
                      {m} m
                    </button>
                  ))}
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="simulator-result-box">
              <div className="result-main-col">
                <span className="result-kicker">Tu cuota mensual aproximada:</span>
                <strong className="result-monthly-fee">{formatMoney(cuotaCalculada)}</strong>
                <small className="result-note">Incluye capital, intereses y seguro</small>
              </div>

              <div className="result-stats-col">
                <div className="result-stat-item">
                  <span>Monto solicitado:</span>
                  <strong>{formatMoney(monto)}</strong>
                </div>
                <div className="result-stat-item">
                  <span>Plazo elegido:</span>
                  <strong>{plazo} cuotas</strong>
                </div>
                <div className="result-stat-item">
                  <span>Desembolso neto:</span>
                  <strong className="text-success">{formatMoney(monto)}</strong>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="simulator-cta-btn"
              onClick={handleApply}
            >
              <span>Solicitar mi Crédito Ahora</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div className="simulator-footer-notes">
              <span>🔒 Simulación sin compromiso</span>
              <span>•</span>
              <span>Sin afectar tu historial crediticio</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
