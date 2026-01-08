// ----------------------------------------------------------------------

export interface ExtendFile extends File {
  path?: string;
  preview?: string;
  lastModifiedDate?: Date;
}

export type FileThumbnailProps = React.ComponentProps<'div'> & {
  tooltip?: boolean;
  file: File | string;
  imageView?: boolean;
  className?: string;
  onDownload?: () => void;
  onRemove?: () => void;
  slotProps?: {
    tooltip?: React.HTMLAttributes<HTMLDivElement>;
    removeBtn?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    downloadBtn?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    img?: React.ImgHTMLAttributes<HTMLImageElement>;
    icon?: React.ImgHTMLAttributes<HTMLImageElement>;
  };
};
