import type { SettingsState } from '../types';

import { setFont , mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

import { OptionButton } from './styles';

// ----------------------------------------------------------------------

export type FontFamilyOptionsProps = React.ComponentProps<'div'> & {
  options: string[];
  icon: React.ReactNode;
  value: SettingsState['fontFamily'];
  onChangeOption: (newOption: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function FontFamilyOptions({
  icon,
  value,
  options,
  onChangeOption,
  className,
  style,
  ...other
}: FontFamilyOptionsProps) {
  return (
    <Box
      className={mergeClasses([
        'gap-3 grid grid-cols-2',
        className,
      ])}
      style={style}
      {...other}
    >
      {options.map((option) => {
        const selected = value === option;

        return (
          <OptionButton
            key={option}
            selected={selected}
            onClick={() => onChangeOption(option)}
            className="py-2 gap-1.5 flex-col text-xs"
            style={{
              fontFamily: setFont(option),
            }}
          >
            {icon}
            {option.endsWith('Variable') ? option.replace(' Variable', '') : option}
          </OptionButton>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

export type FontSizeOptionsProps = React.ComponentProps<'div'> & {
  options: [number, number];
  value: SettingsState['fontSize'];
  onChangeOption: (newOption: number) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function FontSizeOptions({
  value,
  options,
  onChangeOption,
  className,
  style,
  ...other
}: FontSizeOptionsProps) {
  return (
    <div
      className={mergeClasses(['relative', className])}
      style={style}
      {...other}
    >
      <input
        type="range"
        min={options[0]}
        max={options[1]}
        step={1}
        value={value}
        onChange={(e) => onChangeOption(Number(e.target.value))}
        className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - options[0]) / (options[1] - options[0])) * 100}%, #e5e7eb ${((value - options[0]) / (options[1] - options[0])) * 100}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{options[0]}px</span>
        <span className="font-semibold text-foreground">{value}px</span>
        <span>{options[1]}px</span>
      </div>
    </div>
  );
}
