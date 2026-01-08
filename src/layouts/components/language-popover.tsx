
import { m } from 'framer-motion';
import { useState, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import { FlagIcon } from 'src/shared/components/flag-icon';
import { CustomPopover } from 'src/shared/components/custom-popover';
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

  const [locale, setLocale] = useState<string>(data[0]?.value || '');

  const currentLang = data.find((lang) => lang.value === locale);

  const handleChangeLang = useCallback(
    (newLang: string) => {
      setLocale(newLang);
      onClose();
    },
    [onClose]
  );

  const renderMenuList = () => (
    <CustomPopover open={open} anchorEl={anchorEl} onClose={onClose}>
      <ul className="w-40 min-h-[72px] p-0 m-0 list-none">
        {data?.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => handleChangeLang(option.value)}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors ${
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
        onClick={onOpen}
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
