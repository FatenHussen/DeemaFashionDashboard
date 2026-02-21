import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export const bulletColor = { dark: '#282F37', light: '#EDEFF2' };

// Color values matching the sidebar design
const palette = {
  text: {
    primary: 'rgb(33, 43, 54)',
    secondary: 'rgb(74, 85, 104)', // #4A5568 - default text color
    disabled: 'rgb(145, 158, 171)',
  },
  primary: {
    main: 'rgb(51, 102, 204)', // #3366CC - active text/icon color
    mainChannel: '51 102 204',
    light: 'rgb(94, 190, 247)',
  },
  action: {
    hover: 'rgba(145, 158, 171, 0.08)',
    selected: 'rgba(230, 230, 255, 1)', // #E6E6FF - active background
  },
};

function colorVars(variant?: 'vertical' | 'mini' | 'horizontal'): React.CSSProperties {
  return {
    '--nav-item-color': palette.text.secondary,
    '--nav-item-hover-bg': 'rgba(145, 158, 171, 0.08)',
    '--nav-item-caption-color': palette.text.disabled,
    // root
    '--nav-item-root-active-color': palette.primary.main, // #3366CC
    '--nav-item-root-active-color-on-dark': palette.primary.light,
    '--nav-item-root-active-bg': 'rgb(230, 230, 255)', // #E6E6FF
    '--nav-item-root-active-hover-bg': 'rgb(230, 230, 255)',
    '--nav-item-root-open-color': palette.text.primary,
    '--nav-item-root-open-bg': 'rgba(145, 158, 171, 0.06)',
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
    '--nav-item-gap': '4px',
    '--nav-item-radius': '6px',
    '--nav-item-pt': '12px',
    '--nav-item-pr': '16px',
    '--nav-item-pb': '12px',
    '--nav-item-pl': '16px',
    // root
    '--nav-item-root-height': '48px',
    // sub
    '--nav-item-sub-height': '44px',
    // icon
    '--nav-icon-size': '20px',
    '--nav-icon-margin': '0 12px 0 0',
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
