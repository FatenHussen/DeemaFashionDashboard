import type { SettingsState } from '../types';

import { mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

import { OptionButton } from './styles';

// ----------------------------------------------------------------------

export type PresetsOptionsProps = React.ComponentProps<'div'> & {
  icon: React.ReactNode;
  value: SettingsState['primaryColor'];
  options: { name: SettingsState['primaryColor']; value: string }[];
  onChangeOption: (newOption: SettingsState['primaryColor']) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function PresetsOptions({
  icon,
  value,
  options,
  onChangeOption,
  className,
  style,
  ...other
}: PresetsOptionsProps) {
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
        const selected = value === option.name;

        return (
          <OptionButton
            key={option.name}
            onClick={() => onChangeOption(option.name)}
            className="h-16 relative"
            style={{
              color: option.value,
            }}
          >
            {selected && (
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  backgroundColor: option.value,
                  opacity: 0.08,
                }}
              />
            )}
            <span className="relative z-10">{icon}</span>
          </OptionButton>
        );
      })}
    </Box>
  );
}
