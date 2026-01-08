import type { PopoverArrow, PopoverOrigin } from './types';

// ----------------------------------------------------------------------

const POPOVER_DISTANCE = 0.75;

export type CalculateAnchorOriginProps = {
  paperStyles?: React.CSSProperties;
  anchorOrigin: PopoverOrigin;
  transformOrigin: PopoverOrigin;
};

export function calculateAnchorOrigin(
  arrow: PopoverArrow['placement']
): CalculateAnchorOriginProps {
  let props: CalculateAnchorOriginProps;

  switch (arrow) {
    /**
     * top-*
     */
    case 'top-left':
      props = {
        paperStyles: { marginLeft: `-${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
      };
      break;
    case 'top-center':
      props = {
        paperStyles: undefined,
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        transformOrigin: { vertical: 'top', horizontal: 'center' },
      };
      break;
    case 'top-right':
      props = {
        paperStyles: { marginLeft: `${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        transformOrigin: { vertical: 'top', horizontal: 'right' },
      };
      break;
    /**
     * bottom-*
     */
    case 'bottom-left':
      props = {
        paperStyles: { marginLeft: `-${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'top', horizontal: 'left' },
        transformOrigin: { vertical: 'bottom', horizontal: 'left' },
      };
      break;
    case 'bottom-center':
      props = {
        paperStyles: undefined,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        transformOrigin: { vertical: 'bottom', horizontal: 'center' },
      };
      break;
    case 'bottom-right':
      props = {
        paperStyles: { marginLeft: `${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        transformOrigin: { vertical: 'bottom', horizontal: 'right' },
      };
      break;
    /**
     * left-*
     */
    case 'left-top':
      props = {
        paperStyles: { marginTop: `-${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
      };
      break;
    case 'left-center':
      props = {
        paperStyles: undefined,
        anchorOrigin: { vertical: 'center', horizontal: 'right' },
        transformOrigin: { vertical: 'center', horizontal: 'left' },
      };
      break;
    case 'left-bottom':
      props = {
        paperStyles: { marginTop: `${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        transformOrigin: { vertical: 'bottom', horizontal: 'left' },
      };
      break;
    /**
     * right-*
     */
    case 'right-top':
      props = {
        paperStyles: { marginTop: `-${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'top', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'right' },
      };
      break;
    case 'right-center':
      props = {
        paperStyles: undefined,
        anchorOrigin: { vertical: 'center', horizontal: 'left' },
        transformOrigin: { vertical: 'center', horizontal: 'right' },
      };
      break;
    case 'right-bottom':
      props = {
        paperStyles: { marginTop: `${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'bottom', horizontal: 'right' },
      };
      break;

    // top-right
    default:
      props = {
        paperStyles: { marginLeft: `${POPOVER_DISTANCE * 8}px` },
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        transformOrigin: { vertical: 'top', horizontal: 'right' },
      };
  }

  return props;
}
