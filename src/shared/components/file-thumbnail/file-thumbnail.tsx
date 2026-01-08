import type { FileThumbnailProps } from './types';

import { mergeClasses } from 'minimal-shared/utils';

import { Tooltip } from 'src/shared/ui';

import { fileThumbnailClasses } from './classes';
import { fileData, fileThumb, fileFormat } from './utils';
import { RemoveButton, DownloadButton } from './action-buttons';

// ----------------------------------------------------------------------

export function FileThumbnail({
  file,
  tooltip,
  onRemove,
  imageView,
  slotProps,
  onDownload,
  className,
  ...other
}: FileThumbnailProps) {
  const { icon, removeBtn, downloadBtn, tooltip: tooltipProps } = slotProps ?? {};

  const { name, path } = fileData(file);

  const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

  const format = fileFormat(path ?? previewUrl);

  const renderItem = () => (
    <span
      className={mergeClasses([
        fileThumbnailClasses.root,
        'w-9 h-9 shrink-0 items-center relative inline-flex justify-center rounded-[10px]',
        className,
      ])}
      {...other}
    >
      {format === 'image' && imageView ? (
        <img
          src={previewUrl}
          className={mergeClasses([fileThumbnailClasses.img, 'w-full h-full object-cover rounded-inherit'])}
          {...slotProps?.img}
        />
      ) : (
        <img
          src={fileThumb(format)}
          className={mergeClasses([fileThumbnailClasses.icon, 'w-full h-full'])}
          {...icon}
        />
      )}

      {onRemove && (
        <RemoveButton
          onClick={onRemove}
          className={fileThumbnailClasses.removeBtn}
          {...removeBtn}
        />
      )}

      {onDownload && (
        <DownloadButton
          onClick={onDownload}
          className={fileThumbnailClasses.downloadBtn}
          {...downloadBtn}
        />
      )}
    </span>
  );

  if (tooltip) {
    return (
      <Tooltip title={name} {...tooltipProps}>
        {renderItem()}
      </Tooltip>
    );
  }

  return renderItem();
}
