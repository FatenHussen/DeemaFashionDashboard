import { mergeClasses } from 'minimal-shared/utils';

import { IconButton } from 'src/shared/ui';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function DownloadButton({ className, ...other }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={mergeClasses([
        'p-0 top-0 right-0 w-full h-full z-[9] opacity-0 absolute text-white rounded-inherit transition-opacity',
        'hover:opacity-100 hover:backdrop-blur-sm hover:bg-black/64',
        className,
      ])}
      {...other}
    >
      <Iconify width={24} icon="eva:cloud-download-fill" />
    </button>
  );
}

// ----------------------------------------------------------------------

export function RemoveButton({ className, ...other }: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>) {
  return (
    <IconButton
      size="small"
      className={mergeClasses([
        'p-1.5 top-1 right-1 absolute text-white bg-black/48 hover:bg-black/72',
        className,
      ])}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={12} />
    </IconButton>
  );
}
