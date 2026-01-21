import type { SimpleCompactContentProps } from './content';
import type { MainSectionProps, HeaderSectionProps, LayoutSectionProps } from '../core';

import { merge } from 'es-toolkit';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Box, Alert } from 'src/shared/ui';
import { Logo } from 'src/shared/components/logo';

import { SimpleCompactContent } from './content';
import { SettingsButton } from '../components/settings-button';
import { MainSection, LayoutSection, HeaderSection } from '../core';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'className' | 'children' | 'cssVars'>;

export type SimpleLayoutProps = LayoutBaseProps & {
  layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    content?: SimpleCompactContentProps & { compact?: boolean };
  };
  className?: string;
  style?: React.CSSProperties;
};

export function SimpleLayout({
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
  className,
  style,
}: SimpleLayoutProps) {
  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: { className: 'max-w-none' },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" className="hidden rounded-none">
          This is an info Alert.
        </Alert>
      ),
      leftArea: <Logo href="/" />,
      rightArea: (
        <Box className="flex items-center gap-2 sm:gap-3">
          {/** @slot Help link */}
          <RouterLink
            href={paths.faqs}
            className="text-inherit text-sm font-medium hover:underline"
          >
            Need help?
          </RouterLink>

          {/** @slot Settings button */}
          <SettingsButton />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        className={slotProps?.header?.className}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => {
    const { compact, ...restContentProps } = slotProps?.content ?? {};

    return (
      <MainSection {...slotProps?.main}>
        {compact ? (
          <SimpleCompactContent layoutQuery={layoutQuery} {...restContentProps}>
            {children}
          </SimpleCompactContent>
        ) : (
          children
        )}
      </MainSection>
    );
  };

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ '--layout-simple-content-compact-width': '448px', ...cssVars } as any}
      className={className}
      style={style}
    >
      {renderMain()}
    </LayoutSection>
  );
}
