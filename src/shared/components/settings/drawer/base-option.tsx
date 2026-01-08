import { mergeClasses } from 'minimal-shared/utils';

import { Switch, Tooltip } from 'src/shared/ui';

import { Iconify } from '../../iconify';

// ----------------------------------------------------------------------

export type BaseOptionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tooltip?: string;
  selected: boolean;
  icon: React.ReactNode;
  onChangeOption: () => void;
};

export function BaseOption({
  icon,
  label,
  tooltip,
  selected,
  onChangeOption,
  className,
  ...other
}: BaseOptionProps) {
  return (
    <button
      type="button"
      onClick={onChangeOption}
      className={mergeClasses([
        'cursor-pointer flex-col items-start p-4 rounded-2xl',
        'border border-border',
        'hover:bg-muted/50',
        selected ? 'bg-muted/50' : '',
        className,
      ])}
      style={{
        borderColor: selected ? 'rgba(145, 158, 171, 0.12)' : undefined,
      }}
      {...other}
    >
      <div className="w-full flex items-center mb-3 justify-between">
        {icon}
        <Switch
          name={label}
          checked={selected}
          className="mr-[-6px]"
          onChange={() => {}}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="w-full flex items-center justify-between">
        <span className="leading-[18px] text-[13px] font-semibold">{label}</span>

        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <Iconify width={16} icon="eva:info-outline" className="cursor-pointer text-muted-foreground" />
          </Tooltip>
        )}
      </div>
    </button>
  );
}
