import type { AuthSplitSectionProps } from './section';
import type { AuthSplitContentProps } from './content';
import type { MainSectionProps, LayoutSectionProps, HeaderSectionProps } from '../core';

import { merge } from 'es-toolkit';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import { Logo } from 'src/shared/components/logo';

import { AuthSplitSection } from './section';
import { AuthSplitContent } from './content';
import { SettingsButton } from '../components/settings-button';
import { MainSection, LayoutSection, HeaderSection } from '../core';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'className' | 'children' | 'cssVars'>;

export type AuthSplitLayoutProps = LayoutBaseProps & {
  layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    section?: Omit<AuthSplitSectionProps, 'layoutQuery'> & {
      layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    };
    content?: Omit<AuthSplitContentProps, 'layoutQuery'> & {
      layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    };
  };
};

export function AuthSplitLayout({
  className,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: AuthSplitLayoutProps) {
  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {};

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: <div className="hidden rounded-none">This is an info Alert.</div>,
      leftArea: (
        <>
          {/** @slot Logo */}
          <Logo href="/" />
        </>
      ),
      rightArea: (
        <div className="flex items-center gap-2 sm:gap-3">
          {/** @slot Help link */}
          <RouterLink href={paths.faqs} className="text-inherit text-sm font-medium">
            Need help?
          </RouterLink>

          {/** @slot Settings button */}
          <SettingsButton />
        </div>
      ),
    };

    const positionClass =
      layoutQuery === 'md'
        ? 'md:fixed'
        : layoutQuery === 'lg'
          ? 'lg:fixed'
          : layoutQuery === 'xl'
            ? 'xl:fixed'
            : 'sm:fixed';

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps || {})}
        className={`${positionClass} ${slotProps?.header?.className || ''}`}
      />
    );
  };

  const renderFooter = () => null;

  const flexDirectionClass =
    layoutQuery === 'md'
      ? 'md:flex-row'
      : layoutQuery === 'lg'
        ? 'lg:flex-row'
        : layoutQuery === 'xl'
          ? 'xl:flex-row'
          : 'sm:flex-row';

  const renderMain = () => {
    let sectionLayoutQuery: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
    let contentLayoutQuery: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';

    if (layoutQuery === 'xs') {
      sectionLayoutQuery = 'sm';
      contentLayoutQuery = 'sm';
    } else if (layoutQuery === 'sm') {
      sectionLayoutQuery = 'sm';
      contentLayoutQuery = 'sm';
    } else if (layoutQuery === 'md') {
      sectionLayoutQuery = 'md';
      contentLayoutQuery = 'md';
    } else if (layoutQuery === 'lg') {
      sectionLayoutQuery = 'lg';
      contentLayoutQuery = 'lg';
    } else if (layoutQuery === 'xl') {
      sectionLayoutQuery = 'xl';
      contentLayoutQuery = 'xl';
    }

    // Extract layoutQuery from slotProps to avoid type conflicts
    const { layoutQuery: sectionLayoutQueryOverride, ...restSectionProps } =
      slotProps?.section || {};
    const { layoutQuery: contentLayoutQueryOverride, ...restContentProps } =
      slotProps?.content || {};

    const finalSectionLayoutQuery: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = sectionLayoutQueryOverride
      ? sectionLayoutQueryOverride === 'xs'
        ? 'sm'
        : (sectionLayoutQueryOverride as 'sm' | 'md' | 'lg' | 'xl')
      : sectionLayoutQuery;
    const finalContentLayoutQuery: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = contentLayoutQueryOverride
      ? contentLayoutQueryOverride === 'xs'
        ? 'sm'
        : (contentLayoutQueryOverride as 'sm' | 'md' | 'lg' | 'xl')
      : contentLayoutQuery;

    return (
      <MainSection
        {...slotProps?.main}
        className={`${flexDirectionClass} ${slotProps?.main?.className || ''}`}
      >
        <AuthSplitSection
          layoutQuery={finalSectionLayoutQuery}
          method={CONFIG.auth.method}
          {...restSectionProps}
          methods={[
            {
              label: 'Jwt',
              path: paths.auth.jwt.signIn,
              icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-jwt.svg`,
            },
            {
              label: 'Firebase',
              path: paths.auth.firebase.signIn,
              icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-firebase.svg`,
            },
            {
              label: 'Amplify',
              path: paths.auth.amplify.signIn,
              icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-amplify.svg`,
            },
            {
              label: 'Auth0',
              path: paths.auth.auth0.signIn,
              icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-auth0.svg`,
            },
            {
              label: 'Supabase',
              path: paths.auth.supabase.signIn,
              icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-supabase.svg`,
            },
          ]}
        />
        <AuthSplitContent layoutQuery={finalContentLayoutQuery} {...restContentProps}>
          {children}
        </AuthSplitContent>
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
      cssVars={{ '--layout-auth-content-width': '420px', ...cssVars } as React.CSSProperties}
      className={className}
    >
      {renderMain()}
    </LayoutSection>
  );
}
