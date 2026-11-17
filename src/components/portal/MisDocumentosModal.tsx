import React, { useEffect, useState } from 'react';
import { api, type PortalSoportesResponse, type TipoSoportePortal } from '../../api';

type Props = {
  token: string;
  creditoId: number;
  consecutivo: string;
  formatMoney: (val?: number | null) => string;
  onClose: () => void;
};

const MAX_ARCHIVO_BYTES = 8 * 1024 * 1024;

const TIPO_LABEL: Record<TipoSoportePortal, string> = {
  CEDULA_FRENTE: 'Cédula · frente',
  CEDULA_REVERSO: 'Cédula · reverso',
  FOTO_ROSTRO: 'Foto de tu rostro (selfie)',
  CERTIFICADO_COMPRA_CARTERA: 'Certificado de deuda'
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
    reader.readAsDataURL(file);
  });

type Slot = {
  key: string;
  tipo: TipoSoportePortal;
  idCompraCartera: number | null;
  estado: 'FALTA' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  nombreArchivo?: string;
  observacion?: string | null;
};

const ESTADO_TEXTO: Record<Slot['estado'], string> = {
  FALTA: 'Falta cargarlo',
  PENDIENTE: 'En revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado'
};

export const MisDocumentosModal: React.FC<Props> = ({ token, creditoId, consecutivo, formatMoney, onClose }) => {
  const [data, setData] = useState<PortalSoportesResponse | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listSoportesCredito(token, creditoId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar tus documentos'));
  }, [token, creditoId]);

  const slots: Slot[] = data
    ? [
        ...data.soportes.map((item) => ({ key: `s${item.id}`, tipo: item.tipo, idCompraCartera: item.idCompraCartera, estado: item.estado, nombreArchivo: item.nombreArchivo, observacion: item.observacion })),
        ...data.faltantes.map((item) => ({ key: `f${item.tipo}${item.idCompraCartera ?? ''}`, tipo: item.tipo, idCompraCartera: item.idCompraCartera, estado: 'FALTA' as const }))
      ]
    : [];
  const porHacer = slots.filter((slot) => slot.estado === 'FALTA' || slot.estado === 'RECHAZADO').length;

  const subir = async (slot: Slot, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) { setError(`El archivo "${file.name}" supera 8 MB.`); return; }
    setUploading(slot.key);
    setError('');
    try {
      setData(await api.subirSoporteCredito(token, creditoId, {
        tipo: slot.tipo,
        idCompraCartera: slot.idCompraCartera,
        archivo: { nombre: file.name, mimeType: file.type, base64: await fileToBase64(file) }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el documento');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="onboarding-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="mis-docs-title">
      <div className="onboarding-modal-card doc-modal-card mis-docs animate-fadeIn">
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        <h2 id="mis-docs-title">Documentos de la solicitud #{consecutivo}</h2>
        <p className="mis-docs-intro">
          {!data ? 'Cargando…' : porHacer > 0 ? `Tienes ${porHacer} documento(s) por cargar o corregir.` : 'Todos tus documentos están cargados. Te avisaremos si alguno necesita corrección.'}
        </p>

        <ul className="mis-docs-list">
          {slots.map((slot) => {
            const compra = data?.compras.find((item) => item.id === slot.idCompraCartera);
            const puedeSubir = slot.estado !== 'APROBADO';
            return (
              <li key={slot.key} className={`mis-doc estado-${slot.estado.toLowerCase()}`}>
                <div className="mis-doc-info">
                  <strong>{TIPO_LABEL[slot.tipo]}</strong>
                  {compra && <small>{compra.entidad} · {formatMoney(compra.valor)}</small>}
                  {slot.nombreArchivo && <small>{slot.nombreArchivo}</small>}
                  {slot.estado === 'RECHAZADO' && slot.observacion && <small className="mis-doc-motivo">Motivo: {slot.observacion}</small>}
                </div>
                <span className="mis-doc-estado">{ESTADO_TEXTO[slot.estado]}</span>
                {puedeSubir && (
                  <label className="mis-doc-upload">
                    <input
                      type="file"
                      accept={slot.tipo === 'FOTO_ROSTRO' ? 'image/jpeg,image/png,image/webp' : 'application/pdf,image/jpeg,image/png,image/webp'}
                      disabled={uploading !== null}
                      onChange={(event) => { void subir(slot, event.target.files?.[0]); event.target.value = ''; }}
                    />
                    <span>{uploading === slot.key ? 'Cargando…' : slot.estado === 'FALTA' ? 'Cargar' : 'Reemplazar'}</span>
                  </label>
                )}
              </li>
            );
          })}
        </ul>
        {error && <p className="mis-docs-error" role="alert">{error}</p>}
      </div>
    </div>
  );
};
