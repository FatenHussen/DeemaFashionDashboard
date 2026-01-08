import { mergeClasses } from 'minimal-shared/utils';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

export interface AlertProps {
  severity?: AlertSeverity;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const severityClasses: Record<AlertSeverity, string> = {
  error: 'bg-red-50 text-red-800 border-red-200',
  warning:
    'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success:
    'bg-green-50 text-green-800 border-green-200',
};

export function Alert({ severity = 'info', children, className, onClose, icon }: AlertProps) {
  return (
    <div
      className={mergeClasses([
        'flex items-start gap-3 rounded-lg border p-4',
        severityClasses[severity],
        className,
      ])}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex-1 text-sm">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-current opacity-70 hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

