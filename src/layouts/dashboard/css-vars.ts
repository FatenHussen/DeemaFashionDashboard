import type { SettingsState } from 'src/shared/components/settings';

// ----------------------------------------------------------------------

export function dashboardLayoutVars() {
  return {
    '--layout-transition-easing': 'linear',
    '--layout-transition-duration': '120ms',
    '--layout-nav-mini-width': '88px',
    '--layout-nav-vertical-width': '180px',
    '--layout-nav-horizontal-height': '64px',
    '--layout-dashboard-content-pt': '8px',
    '--layout-dashboard-content-pb': '32px',
    '--layout-dashboard-content-px': '40px',
  };
}

// ----------------------------------------------------------------------

export function dashboardNavColorVars(
  navColor: SettingsState['navColor'] = 'integrate',
  navLayout: SettingsState['navLayout'] = 'vertical'
): Record<'layout' | 'section', Record<string, string> | undefined> {
  switch (navColor) {
    case 'integrate':
      return {
        layout: {
          '--layout-nav-bg': 'var(--color-background-default)',
          '--layout-nav-horizontal-bg': 'rgba(255, 255, 255, 0.8)',
          '--layout-nav-border-color': 'rgba(0, 0, 0, 0.12)',
          '--layout-nav-text-primary-color': 'var(--color-text-primary)',
          '--layout-nav-text-secondary-color': 'var(--color-text-secondary)',
          '--layout-nav-text-disabled-color': 'var(--color-text-disabled)',
        },
        section: undefined,
      };
    case 'apparent':
      return {
        layout: {
          '--layout-nav-bg': '#111827',
          '--layout-nav-horizontal-bg': 'rgba(17, 24, 39, 0.96)',
          '--layout-nav-border-color': 'transparent',
          '--layout-nav-text-primary-color': '#ffffff',
          '--layout-nav-text-secondary-color': '#9ca3af',
          '--layout-nav-text-disabled-color': '#6b7280',
        },
        section: {
          '--nav-item-caption-color': '#6b7280',
          '--nav-subheader-color': '#6b7280',
          '--nav-subheader-hover-color': '#ffffff',
          '--nav-item-color': '#9ca3af',
          '--nav-item-root-active-color': '#60a5fa',
          '--nav-item-root-open-color': '#ffffff',
          '--nav-bullet-light-color': '#ffffff',
          ...(navLayout === 'vertical' && {
            '--nav-item-sub-active-color': '#ffffff',
            '--nav-item-sub-open-color': '#ffffff',
          }),
        },
      };
    default:
      throw new Error(`Invalid color: ${navColor}`);
  }
}
