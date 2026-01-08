import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export const bulletColor = { dark: '#282F37', light: '#EDEFF2' };

// Placeholder color values - these should match your design system
const palette = {
  text: {
    primary: 'rgb(33, 43, 54)',
    secondary: 'rgb(99, 115, 129)',
    disabled: 'rgb(145, 158, 171)',
  },
  primary: {
    main: 'rgb(0, 167, 255)',
    mainChannel: '0 167 255',
    light: 'rgb(94, 190, 247)',
  },
  action: {
    hover: 'rgba(145, 158, 171, 0.08)',
    selected: 'rgba(145, 158, 171, 0.16)',
  },
};

function colorVars(variant?: 'vertical' | 'mini' | 'horizontal'): React.CSSProperties {
  return {
    '--nav-item-color': palette.text.secondary,
    '--nav-item-hover-bg': varAlpha(palette.primary.mainChannel, 0.06),
    '--nav-item-caption-color': palette.text.disabled,
    // root
    '--nav-item-root-active-color': palette.primary.main,
    '--nav-item-root-active-color-on-dark': palette.primary.light,
    '--nav-item-root-active-bg': varAlpha(palette.primary.mainChannel, 0.12),
    '--nav-item-root-active-hover-bg': varAlpha(palette.primary.mainChannel, 0.18),
    '--nav-item-root-open-color': palette.text.primary,
    '--nav-item-root-open-bg': varAlpha(palette.primary.mainChannel, 0.06),
    // sub
    '--nav-item-sub-active-color': palette.text.primary,
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
    '--nav-item-gap': '8px',
    '--nav-item-radius': '8px',
    '--nav-item-pt': '8px',
    '--nav-item-pr': '6px',
    '--nav-item-pb': '8px',
    '--nav-item-pl': '8px',
    // root
    '--nav-item-root-height': '52px',
    // sub
    '--nav-item-sub-height': '44px',
    // icon
    '--nav-icon-size': '18px',
    '--nav-icon-margin': '0 6px 0 0',
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
    '--nav-item-root-padding': '8px 4px 6px 4px',
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
