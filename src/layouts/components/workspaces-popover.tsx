import type { HTMLAttributes } from 'react';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePopover } from 'minimal-shared/hooks';

import { Label } from 'src/shared/components/label';
import { Iconify } from 'src/shared/components/iconify';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { CustomPopover } from 'src/shared/components/custom-popover';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = HTMLAttributes<HTMLButtonElement> & {
  data?: {
    id: string;
    name: string;
    logo: string;
    plan: string;
  }[];
};

export function WorkspacesPopover({ data = [], className, ...other }: WorkspacesPopoverProps) {
  const { t } = useTranslation('common');
  const { open, anchorEl, onClose, onOpen } = usePopover();

  const [workspace, setWorkspace] = useState(data[0]);

  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[0]) => {
      setWorkspace(newValue);
      onClose();
    },
    [onClose]
  );

  const renderButton = () => (
    <button
      type="button"
      onClick={onOpen}
      className={`relative py-0.5 gap-1 sm:gap-2 inline-flex items-center hover:bg-muted rounded-lg transition-colors before:content-[''] before:h-full before:-z-10 before:opacity-0 before:rounded before:absolute before:bg-muted before:w-[calc(100%+8px)] before:transition-all ${
        open ? 'before:opacity-100 before:visible' : 'before:invisible'
      } ${className || ''}`}
      {...other}
    >
      <img
        alt={workspace?.name}
        src={workspace?.logo}
        className="w-6 h-6 rounded-full"
      />

      <span className="hidden sm:inline-flex text-sm font-semibold">
        {workspace?.name}
      </span>

      <Label
        color={workspace?.plan === 'Free' ? 'default' : 'info'}
        className="h-[22px] cursor-inherit hidden sm:inline-flex"
      >
        {workspace?.plan}
      </Label>

      <Iconify width={16} icon="carbon:chevron-sort" className="text-muted-foreground" />
    </button>
  );

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        arrow: { placement: 'top-left' },
        paper: { style: { marginTop: 4, marginLeft: -24.8, width: 240 } },
      }}
    >
      <Scrollbar style={{ maxHeight: 240 }}>
        <ul className="p-0 m-0 list-none">
          {data.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => handleChangeWorkspace(option)}
                className={`w-full h-12 px-3 flex items-center gap-2 hover:bg-muted transition-colors ${
                  option.id === workspace?.id ? 'bg-muted' : ''
                }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {option.logo ? (
                    <img src={option.logo} alt={option.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-foreground">
                      {option.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <span className="flex-1 text-sm font-medium truncate">
                  {option.name}
                </span>

                <Label color={option.plan === 'Free' ? 'default' : 'info'}>{option.plan}</Label>
              </button>
            </li>
          ))}
        </ul>
      </Scrollbar>

      <hr className="my-1 border-dashed border-border" />

      <button
        type="button"
        onClick={() => {
          onClose();
        }}
        className="w-full px-3 py-2 flex items-center gap-2 text-sm font-medium hover:bg-muted transition-colors"
      >
        <Iconify width={18} icon="mingcute:add-line" className="w-6 h-6 flex items-center justify-center" />
        <span>{t('createWorkspace')}</span>
      </button>
    </CustomPopover>
  );

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
