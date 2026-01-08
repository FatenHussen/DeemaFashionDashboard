import type { SettingsState } from '../types';

import { mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

import { OptionButton } from './styles';

// ----------------------------------------------------------------------

export type NavLayoutOptionProps = React.ComponentProps<'div'> & {
  value: SettingsState['navLayout'];
  options: {
    value: SettingsState['navLayout'];
    icon: React.ReactNode;
  }[];
  onChangeOption: (newOption: SettingsState['navLayout']) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function NavLayoutOptions({
  value,
  options,
  onChangeOption,
  className,
  style,
  ...other
}: NavLayoutOptionProps) {
  return (
    <Box
      className={mergeClasses([
        'gap-3 grid grid-cols-3',
        className,
      ])}
      style={style}
      {...other}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <OptionButton
            key={option.value}
            selected={selected}
            onClick={() => onChangeOption(option.value)}
            className="h-16 border border-border"
            style={{
              borderColor: selected ? 'rgba(145, 158, 171, 0.08)' : undefined,
            }}
          >
            {option.icon}
          </OptionButton>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

export type NavColorOptionProps = React.ComponentProps<'div'> & {
  value: SettingsState['navColor'];
  options: {
    label: string;
    value: SettingsState['navColor'];
    icon: React.ReactNode;
  }[];
  onChangeOption: (newOption: SettingsState['navColor']) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function NavColorOptions({
  value,
  options,
  onChangeOption,
  className,
  style,
  ...other
}: NavColorOptionProps) {
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
        const selected = value === option.value;

        return (
          <OptionButton
            key={option.value}
            selected={selected}
            onClick={() => onChangeOption(option.value)}
            className="gap-3 h-14"
          >
            {option.icon}
            {option.label}
          </OptionButton>
        );
      })}
    </Box>
  );
}
