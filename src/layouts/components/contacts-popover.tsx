import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePopover } from 'minimal-shared/hooks';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/shared/components/iconify';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { CustomPopover } from 'src/shared/components/custom-popover';
import { varTap, varHover, transitionTap } from 'src/shared/components/animate';

// ----------------------------------------------------------------------

export type ContactsPopoverProps = React.ComponentPropsWithoutRef<'button'> & {
  data?: {
    id: string;
    role: string;
    name: string;
    email: string;
    status: string;
    address: string;
    avatarUrl: string;
    phoneNumber: string;
    lastActivity: string;
  }[];
};

export function ContactsPopover({ data = [], className, ...other }: ContactsPopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const { t } = useTranslation('common');

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'bg-green-500';
    if (status === 'offline') return 'bg-gray-400';
    return 'bg-yellow-500';
  };

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{ arrow: { offset: 20 } }}
    >
      <h6 className="text-lg font-semibold p-3 mb-0">
        {t('contactsPopoverTitle')} <span>({data.length})</span>
      </h6>

      <Scrollbar style={{ height: 320, width: 320 }}>
        <ul className="p-0 m-0 list-none">
          {data.map((contact) => (
            <li key={contact.id}>
              <button
                type="button"
                className="w-full p-2 flex items-center gap-2 hover:bg-muted transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {contact.avatarUrl ? (
                      <img
                        src={contact.avatarUrl}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {contact.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}
                  />
                </div>

                <div className="flex-1 text-start min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{contact.name}</div>
                  {contact.status === 'offline' && (
                    <div className="text-xs text-muted-foreground">
                      {fToNow(contact.lastActivity)}
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Scrollbar>
    </CustomPopover>
  );

  const { onAnimationStart, onAnimationEnd, onAnimationIteration, ...buttonProps } = other;

  return (
    <>
      <m.button
        type="button"
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label={t('contactsButton')}
        onClick={onOpen}
        className={`p-0 w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors ${
          open ? 'bg-muted' : ''
        } ${className || ''}`}
        {...(buttonProps as any)}
      >
        <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
      </m.button>

      {renderMenuList()}
    </>
  );
}
