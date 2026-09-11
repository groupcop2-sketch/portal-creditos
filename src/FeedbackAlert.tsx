import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type FeedbackKind = 'success' | 'error' | 'info';

const ERROR_PATTERN = /no se pudo|no se pudieron|invalida|inválida|error|debe |bloqueo|selecciona una|credenciales|no se puede/;
const SUCCESS_PATTERN = /correctamente|iniciada|cerrada|creado|creada|guardada|actualizada|publicada|generada|registrada|activada|enviada|agregado|completada/;

export function inferFeedbackKind(text: string): FeedbackKind {
  if (!text) return 'info';
  const value = text.toLowerCase();
  if (ERROR_PATTERN.test(value)) return 'error';
  if (SUCCESS_PATTERN.test(value)) return 'success';
  return 'info';
}

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info
};

const defaultTitles: Record<FeedbackKind, string> = {
  error: 'Ocurrio un error',
  success: 'Operacion exitosa',
  info: 'Informacion'
};

type FeedbackAlertProps = {
  message: string;
  kind?: FeedbackKind;
  title?: string;
  onDismiss?: () => void;
  variant?: 'inline' | 'toast';
};

export function FeedbackAlert({
  message,
  kind,
  title,
  onDismiss,
  variant = 'inline'
}: FeedbackAlertProps) {
  if (!message) return null;

  const resolved = kind ?? inferFeedbackKind(message);
  const Icon = icons[resolved];
  const heading = title ?? defaultTitles[resolved];

  return (
    <div
      className={`feedback-alert feedback-${resolved} feedback-${variant}`}
      role="alert"
      aria-live={resolved === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Icon className="feedback-icon" aria-hidden size={20} strokeWidth={2.25} />
      <div className="feedback-body">
        <strong className="feedback-title">{heading}</strong>
        <p>{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="feedback-dismiss"
          onClick={onDismiss}
          aria-label="Cerrar alerta"
        >
          <X size={16} strokeWidth={2.4} />
        </button>
      ) : null}
    </div>
  );
}
