
import { m } from 'framer-motion';
import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import { FlagIcon } from 'src/shared/components/flag-icon';
import { CustomPopover } from 'src/shared/components/custom-popover';
import { useLocalizationStore } from 'src/store/useLocalizationStore';
import { varTap, varHover, transitionTap } from 'src/shared/components/animate';

// ----------------------------------------------------------------------

export type LanguagePopoverProps = React.ComponentPropsWithoutRef<'button'> & {
  data?: {
    value: string;
    label: string;
    countryCode: string;
  }[];
};

export function LanguagePopover({ data = [], className, ...other }: LanguagePopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();

  const { language, setLanguage } = useLocalizationStore();

  const currentLang = data.find((lang) => lang.value === language) ?? data[0];

  const handleChangeLang = useCallback(
    (newLang: string) => {
      setLanguage(newLang);
      onClose();
    },
    [onClose, setLanguage]
  );

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      slotProps={{ arrow: { offset: 2, placement: 'bottom-left' } }}
    >
      <ul className="w-40 min-h-[72px] p-0 m-0 list-none">
        {data?.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => handleChangeLang(option.value)}
              className={`w-full px-3 py-2 text-start flex items-center gap-2 hover:bg-muted transition-colors ${
                option.value === currentLang?.value ? 'bg-muted' : ''
              }`}
            >
              <FlagIcon code={option.countryCode} />
              <span className="text-sm">{option.label}</span>
            </button>
          </li>
        ))}
      </ul>
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
        aria-label="Languages button"
        onClick={(e) => onOpen(e as any)}
        className={`p-0 w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors ${
          open ? 'bg-muted' : ''
        } ${className || ''}`}
        {...(buttonProps as any)}
      >
        <FlagIcon code={currentLang?.countryCode} />
      </m.button>

      {renderMenuList()}
    </>
  );
}
