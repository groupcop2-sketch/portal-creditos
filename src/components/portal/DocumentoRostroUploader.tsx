import React, { useState, useRef } from 'react';
import { api } from '../../api';

interface DocumentoRostroUploaderProps {
  creditoId: number;
  token?: string | null;
  onSuccess: (data: any) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  showCancelButton?: boolean;
}

interface ImageUploadSlot {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
  loading: boolean;
}

/**
 * Resizes and compresses image to clean JPEG base64 to ensure fast transfer
 */
function compressImageToBase64(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export const DocumentoRostroUploader: React.FC<DocumentoRostroUploaderProps> = ({
  creditoId,
  token,
  onSuccess,
  onCancel,
  title = 'Carga Manual de Identidad y Biometría Facial',
  subtitle = 'Sube las fotografías nítidas de tu cédula original y una foto de tu rostro para verificar tu identidad.',
  showCancelButton = true
}) => {
  const [frente, setFrente] = useState<ImageUploadSlot>({
    file: null,
    previewUrl: null,
    base64: null,
    loading: false
  });
  const [reverso, setReverso] = useState<ImageUploadSlot>({
    file: null,
    previewUrl: null,
    base64: null,
    loading: false
  });
  const [rostro, setRostro] = useState<ImageUploadSlot>({
    file: null,
    previewUrl: null,
    base64: null,
    loading: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputFrenteRef = useRef<HTMLInputElement>(null);
  const inputReversoRef = useRef<HTMLInputElement>(null);
  const inputRostroRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (
    file: File,
    setter: React.Dispatch<React.SetStateAction<ImageUploadSlot>>
  ) => {
    setter((prev) => ({ ...prev, loading: true }));
    try {
      const preview = URL.createObjectURL(file);
      const b64 = await compressImageToBase64(file);
      setter({
        file,
        previewUrl: preview,
        base64: b64,
        loading: false
      });
      setErrorMessage('');
    } catch {
      setter((prev) => ({ ...prev, loading: false }));
      setErrorMessage('No se pudo procesar la imagen seleccionada.');
    }
  };

  const handleRemoveSlot = (
    setter: React.Dispatch<React.SetStateAction<ImageUploadSlot>>,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setter({
      file: null,
      previewUrl: null,
      base64: null,
      loading: false
    });
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frente.base64) {
      setErrorMessage('Debes adjuntar la fotografía del frente de tu documento.');
      return;
    }
    if (!rostro.base64) {
      setErrorMessage('Debes adjuntar la fotografía frontal de tu rostro (selfie).');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const effectiveToken = token || localStorage.getItem('portal_client_token') || '';
      const payload = {
        creditoId,
        documentoFrente: frente.base64,
        documentoReverso: reverso.base64 || null,
        fotoRostro: rostro.base64
      };

      const res = await api.cargarDocumentosJumio(effectiveToken, payload);

      setSuccessMessage('¡Documentos y fotografía recibidos correctamente! Tu crédito ha avanzado a Estudio.');
      setTimeout(() => {
        onSuccess(res);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al enviar los documentos. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = Boolean(frente.base64 && rostro.base64);

  return (
    <div className="doc-uploader-container">
      <div className="doc-uploader-header">
        <div className="header-icon-badge">📁</div>
        <div>
          <h3 className="doc-uploader-title">{title}</h3>
          <p className="doc-uploader-subtitle">{subtitle}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="doc-uploader-error">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="doc-uploader-success">
          <span>✅ {successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="doc-uploader-form">
        <div className="doc-slots-grid">
          {/* SLOT 1: FRENTE CEDULA */}
          <div className={`doc-slot-card ${frente.previewUrl ? 'has-file' : ''}`}>
            <div className="slot-badge">
              <span className="slot-number">1</span>
              <strong>Cédula (Frente) *</strong>
            </div>
            <p className="slot-hint">Foto nítida del frente de tu documento con nombres y número legibles.</p>

            {frente.previewUrl ? (
              <div className="slot-preview-box">
                <img src={frente.previewUrl} alt="Frente documento" className="slot-preview-img" />
                <button
                  type="button"
                  className="btn-slot-remove"
                  onClick={() => handleRemoveSlot(setFrente, inputFrenteRef)}
                  title="Eliminar y seleccionar otra"
                >
                  ✕ Quitar
                </button>
              </div>
            ) : (
              <div
                className="slot-dropzone"
                onClick={() => inputFrenteRef.current?.click()}
              >
                <div className="dropzone-icon">🪪</div>
                <span className="dropzone-text">Seleccionar o tomar foto</span>
                <small className="dropzone-sub">JPG, PNG o WebP</small>
              </div>
            )}
            <input
              ref={inputFrenteRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessFile(f, setFrente);
              }}
            />
          </div>

          {/* SLOT 2: REVERSO CEDULA */}
          <div className={`doc-slot-card ${reverso.previewUrl ? 'has-file' : ''}`}>
            <div className="slot-badge">
              <span className="slot-number">2</span>
              <strong>Cédula (Reverso)</strong>
            </div>
            <p className="slot-hint">Reverso de tu cédula donde se aprecia el código de barras y huella.</p>

            {reverso.previewUrl ? (
              <div className="slot-preview-box">
                <img src={reverso.previewUrl} alt="Reverso documento" className="slot-preview-img" />
                <button
                  type="button"
                  className="btn-slot-remove"
                  onClick={() => handleRemoveSlot(setReverso, inputReversoRef)}
                  title="Eliminar y seleccionar otra"
                >
                  ✕ Quitar
                </button>
              </div>
            ) : (
              <div
                className="slot-dropzone"
                onClick={() => inputReversoRef.current?.click()}
              >
                <div className="dropzone-icon">🔄</div>
                <span className="dropzone-text">Seleccionar o tomar foto</span>
                <small className="dropzone-sub">(Recomendado)</small>
              </div>
            )}
            <input
              ref={inputReversoRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessFile(f, setReverso);
              }}
            />
          </div>

          {/* SLOT 3: ROSTRO (SELFIE) */}
          <div className={`doc-slot-card ${rostro.previewUrl ? 'has-file' : ''}`}>
            <div className="slot-badge">
              <span className="slot-number">3</span>
              <strong>Foto de Rostro *</strong>
            </div>
            <p className="slot-hint">Selfie de frente con fondo claro, sin gorra, gafas oscuras ni mascarilla.</p>

            {rostro.previewUrl ? (
              <div className="slot-preview-box">
                <img src={rostro.previewUrl} alt="Foto de rostro" className="slot-preview-img selfie" />
                <button
                  type="button"
                  className="btn-slot-remove"
                  onClick={() => handleRemoveSlot(setRostro, inputRostroRef)}
                  title="Eliminar y seleccionar otra"
                >
                  ✕ Quitar
                </button>
              </div>
            ) : (
              <div
                className="slot-dropzone selfie-zone"
                onClick={() => inputRostroRef.current?.click()}
              >
                <div className="dropzone-icon">🤳</div>
                <span className="dropzone-text">Tomar o subir selfie</span>
                <small className="dropzone-sub">Foto frontal del rostro</small>
              </div>
            )}
            <input
              ref={inputRostroRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessFile(f, setRostro);
              }}
            />
          </div>
        </div>

        {/* Tips Box */}
        <div className="doc-uploader-tips">
          <span className="tips-icon">💡</span>
          <div>
            <strong>Recomendaciones para una aprobación rápida:</strong>
            <ul>
              <li>Ubica tu documento sobre una superficie plana con buena iluminación natural.</li>
              <li>Evita que los dedos o sombras tapen los números y letras de la cédula.</li>
              <li>Asegúrate de que la foto de tu rostro coincida con la fotografía del documento.</li>
            </ul>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="doc-uploader-actions">
          {showCancelButton && onCancel && (
            <button
              type="button"
              className="btn-secondary-ghost"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="portal-btn-primary glow-pulse"
            disabled={!isFormValid || submitting}
          >
            {submitting ? 'Subiendo y validando...' : 'Guardar y Validar Documentos ➔'}
          </button>
        </div>
      </form>
    </div>
  );
};
