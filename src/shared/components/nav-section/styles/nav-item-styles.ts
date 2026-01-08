// ----------------------------------------------------------------------

type NavItemStyles = {
  icon: React.CSSProperties;
  info: React.CSSProperties;
  texts: React.CSSProperties;
  disabled: React.CSSProperties;
  captionIcon: React.CSSProperties;
  title: () => React.CSSProperties;
  arrow: () => React.CSSProperties;
  captionText: () => React.CSSProperties;
};

export const navItemStyles: NavItemStyles = {
  icon: {
    width: 22,
    height: 22,
    flexShrink: 0,
    display: 'inline-flex',
  },
  texts: { flex: '1 1 auto', display: 'inline-flex', flexDirection: 'column' },
  title: () => ({
    flex: '1 1 auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  info: {
    fontSize: 12,
    flexShrink: 0,
    fontWeight: 600,
    marginLeft: '6px',
    lineHeight: 18 / 12,
    display: 'inline-flex',
  },
  arrow: () => ({
    width: 16,
    height: 16,
    flexShrink: 0,
    marginLeft: '6px',
    display: 'inline-flex',
  }),
  captionIcon: { width: 16, height: 16 },
  captionText: () => ({
    fontSize: '0.75rem',
    lineHeight: 1.5,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  disabled: { opacity: 0.48, pointerEvents: 'none' },
};
