import type { ModalProps } from './modal';

import { Modal } from './modal';

export interface DialogProps extends Omit<ModalProps, 'children'> {
  title?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Dialog({ title, content, actions, ...modalProps }: DialogProps) {
  return (
    <Modal {...modalProps}>
      <div className="flex flex-col">
        {title && (
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
        )}
        {content && (
          <div className="px-6 py-4 text-sm text-foreground">{content}</div>
        )}
        {actions && (
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            {actions}
          </div>
        )}
      </div>
    </Modal>
  );
}

