import { useProductSimulation } from './useProductSimulation';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { PortalProductoCredito } from '../../api';

const getProductIcon = (name: string = '') => {
  const n = name.toLowerCase();
  if (n.includes('compra') || n.includes('cartera')) return '🔄';
  if (n.includes('educat') || n.includes('estudio') || n.includes('univers')) return '🎓';
  if (n.includes('salud') || n.includes('medic') || n.includes('cirug')) return '🩺';
  if (n.includes('vehic') || n.includes('moto') || n.includes('carro') || n.includes('auto')) return '🚗';
  if (n.includes('vivien') || n.includes('hogar') || n.includes('remodel')) return '🏠';
  if (n.includes('anticip') || n.includes('avance')) return '⚡';
  if (n.includes('pension')) return '👴';
  if (n.includes('libre') || n.includes('invers')) return '💳';
  if (n.includes('comerc') || n.includes('negocio') || n.includes('micro')) return '💼';
  return '💰';
};

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chipsTrackRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setMonto(value => Math.min(maxMonto, Math.max(minMonto, value)));
    setPlazo(value => Math.min(maxPlazo, Math.max(minPlazo, value)));
  }, [minMonto, maxMonto, minPlazo, maxPlazo]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSelectProduct = (prod: PortalProductoCredito) => {
    setSelectedProductId(prod.id);
    const pMinMonto = prod.montoMinimo || 1000000;
    const pMaxMonto = prod.montoMaximo || 50000000;
    const pMinPlazo = prod.plazoMinimo || 6;
    const pMaxPlazo = prod.plazoMaximo || 60;
    if (monto < pMinMonto) setMonto(pMinMonto);
    if (monto > pMaxMonto) setMonto(pMaxMonto);
    if (plazo < pMinPlazo) setPlazo(pMinPlazo);
    if (plazo > pMaxPlazo) setPlazo(pMaxPlazo);
    setIsDropdownOpen(false);
  };

  const scrollChips = (dir: 'left' | 'right') => {
    if (chipsTrackRef.current) {
      const amount = dir === 'left' ? -220 : 220;
      chipsTrackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };
  const { simulation, error: simulationError, loading: simulationLoading } = useProductSimulation(activeProduct?.id, monto, plazo);
  const cuotaCalculada = simulation?.resumen.cuotaEstimada;

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
                <strong>{simulation ? simulation.resumen.tasaMensual.toLocaleString('es-CO') + '% M.V.' : '-'}</strong>
              </div>
            </div>

            {/* Product Selector */}
            {productos.length > 1 && (
              <div className="simulator-field-group product-selector-group">
                <div className="simulator-label-row">
                  <label className="simulator-label">Línea de crédito:</label>
                  <span className="product-count-tag">{productos.length} opciones disponibles</span>
                </div>

                {/* Active Product Card with Dropdown Trigger */}
                <div className="product-dropdown-container" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`product-active-card-trigger ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="pac-left">
                      <div className="pac-icon-box">
                        {getProductIcon(activeProduct?.nombre)}
                      </div>
                      <div className="pac-info">
                        <div className="pac-title-row">
                          <strong className="pac-title">{activeProduct?.nombre || 'Selecciona una línea'}</strong>
                          {activeProduct?.tipoCredito && (
                            <span className="pac-type-pill">
                              {activeProduct.tipoCredito.replaceAll('_', ' ')}
                            </span>
                          )}
                        </div>
                        <span className="pac-meta">
                          Hasta {formatMoney(activeProduct?.montoMaximo)} · Hasta {activeProduct?.plazoMaximo} meses
                        </span>
                      </div>
                    </div>
                    <div className="pac-right">
                      <span className="pac-change-text">{isDropdownOpen ? 'Cerrar' : 'Cambiar'}</span>
                      <svg
                        className={`pac-chevron ${isDropdownOpen ? 'rotate' : ''}`}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Dropdown Menu Modal */}
                  {isDropdownOpen && (
                    <div className="product-dropdown-menu">
                      <div className="pdm-header">
                        <div>
                          <strong className="pdm-header-title">Elige tu Línea de Crédito</strong>
                          <span className="pdm-header-sub">Tasas y condiciones adaptadas a tu perfil</span>
                        </div>
                        <button
                          type="button"
                          className="pdm-close-btn"
                          onClick={() => setIsDropdownOpen(false)}
                          aria-label="Cerrar"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="pdm-list">
                        {productos.map((prod) => {
                          const isSelected = activeProduct?.id === prod.id;
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              className={`pdm-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleSelectProduct(prod)}
                            >
                              <div className="pdm-item-icon">
                                {getProductIcon(prod.nombre)}
                              </div>
                              <div className="pdm-item-body">
                                <div className="pdm-item-headline">
                                  <span className="pdm-item-name">{prod.nombre}</span>
                                  {prod.tipoCredito && (
                                    <span className="pdm-item-tag">
                                      {prod.tipoCredito.replaceAll('_', ' ')}
                                    </span>
                                  )}
                                </div>
                                {prod.descripcion && (
                                  <p className="pdm-item-desc">{prod.descripcion}</p>
                                )}
                                <div className="pdm-item-specs">
                                  <span>Monto: <strong>{formatMoney(prod.montoMinimo)} - {formatMoney(prod.montoMaximo)}</strong></span>
                                  <span className="pdm-dot">•</span>
                                  <span>Plazo: <strong>{prod.plazoMinimo} - {prod.plazoMaximo} meses</strong></span>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="pdm-check-mark">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick-Scroll Horizontal Chips (Full names, never truncated!) */}
                <div className="product-quick-chips-wrapper">
                  <button
                    type="button"
                    className="chips-nav-btn left"
                    onClick={() => scrollChips('left')}
                    aria-label="Anterior"
                  >
                    ‹
                  </button>

                  <div className="product-quick-chips-track" ref={chipsTrackRef}>
                    {productos.map((prod) => {
                      const isSelected = activeProduct?.id === prod.id;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          className={`product-quick-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => handleSelectProduct(prod)}
                        >
                          <span className="pqc-icon">{getProductIcon(prod.nombre)}</span>
                          <span className="pqc-text">{prod.nombre}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="chips-nav-btn right"
                    onClick={() => scrollChips('right')}
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
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
                step={1}
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
                <strong className="result-monthly-fee">{simulationLoading ? 'Calculando...' : simulation ? formatMoney(cuotaCalculada) : '-'}</strong>
                <small className="result-note">Incluye capital, interés corriente y cargos configurados</small>
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
                  <strong className="text-success">{simulation ? formatMoney(simulation.resumen.valorDesembolso) : '-'}</strong>
                </div>
              </div>
            </div>

            {simulationError && <p role="alert">{simulationError}</p>}
            {simulation && <div className="result-stats-col">
              <div className="result-stat-item"><span>Cargos financiados:</span><strong>{formatMoney(simulation.resumen.cargosFinanciados)}</strong></div>
              <div className="result-stat-item"><span>Capital real del crédito:</span><strong>{formatMoney(simulation.resumen.valorCredito)}</strong></div>
              {simulation.atributos.filter(a => a.sumaAlCredito || a.sumaALaCuota).map(a => <div className="result-stat-item" key={a.id}>
                <span>{a.nombre}{a.sumaALaCuota ? ' (por cuota)' : ''}{a.aplicaIva ? ' (IVA incluido)' : ''}:</span><strong>{formatMoney(a.valorCalculado)}</strong>
              </div>)}
            </div>}
            {/* CTA Button */}
            <button
              type="button"
              className="simulator-cta-btn"
              disabled={!simulation || simulationLoading}
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
