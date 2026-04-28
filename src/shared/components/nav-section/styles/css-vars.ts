import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export const bulletColor = { dark: '#282F37', light: '#EDEFF2' };

// Sidebar nav — active states use brand primary (darker orange for readability)
const palette = {
  text: {
    primary: 'rgb(17, 24, 39)',
    secondary: 'rgb(55, 65, 81)',
    disabled: 'rgb(107, 114, 128)',
  },
  primary: {
    main: 'rgb(194, 120, 0)',
    mainChannel: '194 120 0',
    light: 'rgb(229, 150, 30)',
  },
  action: {
    hover: 'rgba(194, 120, 0, 0.08)',
    selected: 'rgba(194, 120, 0, 0.12)',
  },
};

function colorVars(variant?: 'vertical' | 'mini' | 'horizontal'): React.CSSProperties {
  return {
    '--nav-item-color': palette.text.secondary,
    '--nav-item-hover-bg': 'rgba(194, 120, 0, 0.08)',
    '--nav-item-caption-color': palette.text.disabled,
    // root
    '--nav-item-root-active-color': palette.primary.main,
    '--nav-item-root-active-color-on-dark': palette.primary.light,
    '--nav-item-root-active-bg': 'rgba(194, 120, 0, 0.12)',
    '--nav-item-root-active-hover-bg': 'rgba(194, 120, 0, 0.16)',
    '--nav-item-root-open-color': palette.text.primary,
    '--nav-item-root-open-bg': 'rgba(194, 120, 0, 0.06)',
    // sub
    '--nav-item-sub-active-color': palette.primary.main,
    '--nav-item-sub-active-bg': varAlpha(palette.primary.mainChannel, 0.08),
    '--nav-item-sub-open-color': palette.text.primary,
    '--nav-item-sub-open-bg': varAlpha(palette.primary.mainChannel, 0.04),
    ...(variant === 'vertical' && {
      '--nav-item-sub-active-bg': varAlpha(palette.primary.mainChannel, 0.08),
      '--nav-subheader-color': palette.text.disabled,
      '--nav-subheader-hover-color': palette.text.primary,
    }),
  } as React.CSSProperties;
}

// ----------------------------------------------------------------------

function verticalVars(): React.CSSProperties {
  return {
    ...colorVars('vertical'),
    '--nav-item-gap': '2px',
    '--nav-item-radius': '10px',
    '--nav-item-pt': '10px',
    '--nav-item-pr': '14px',
    '--nav-item-pb': '10px',
    '--nav-item-pl': '14px',
    // root
    '--nav-item-root-height': '44px',
    // sub
    '--nav-item-sub-height': '40px',
    // icon — gap between icon and label (logical; works in RTL)
    '--nav-icon-size': '20px',
    '--nav-icon-text-gap': '12px',
    '--nav-icon-margin': '0',
    // bullet
    '--nav-bullet-size': '8px',
    '--nav-bullet-light-color': bulletColor.light,
    '--nav-bullet-dark-color': bulletColor.dark,
  } as React.CSSProperties;
}

// ----------------------------------------------------------------------

function miniVars(): React.CSSProperties {
  return {
    ...colorVars('mini'),
    '--nav-item-gap': '4px',
    '--nav-item-radius': '8px',
    // root
    '--nav-item-root-height': '56px',
    '--nav-item-root-padding': '8px 6px 6px 6px',
    // sub
    '--nav-item-sub-height': '34px',
    '--nav-item-sub-padding': '0 8px',
    // icon
    '--nav-icon-size': '22px',
    '--nav-icon-root-margin': '0 0 6px 0',
    '--nav-icon-sub-margin': '0 8px 0 0',
  } as React.CSSProperties;
}

// ----------------------------------------------------------------------

function horizontalVars(): React.CSSProperties {
  return {
    ...colorVars('horizontal'),
    '--nav-item-gap': '6px',
    '--nav-height': '56px',
    '--nav-item-radius': '6px',
    // root
    '--nav-item-root-height': '32px',
    '--nav-item-root-padding': '0 6px',
    // sub
    '--nav-item-sub-height': '34px',
    '--nav-item-sub-padding': '0 8px',
    // icon
    '--nav-icon-size': '22px',
    '--nav-icon-sub-margin': '0 8px 0 0',
    '--nav-icon-root-margin': '0 8px 0 0',
  } as React.CSSProperties;
}

// ----------------------------------------------------------------------

export const navSectionCssVars = {
  mini: miniVars,
  vertical: verticalVars,
  horizontal: horizontalVars,
};
