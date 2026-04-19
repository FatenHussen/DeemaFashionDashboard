import type { GroupBase, MultiValue } from 'react-select';

import { cn } from '@/utils/utils';
import ReactSelect from 'react-select';

// ----------------------------------------------------------------------

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  placeholder?: string;
  noOptionsMessage?: string;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  className?: string;
  isDisabled?: boolean;
  isSearchable?: boolean;
}

/**
 * Tokens in global.css are space-separated RGB triplets, e.g. `--border: 229 231 235`.
 * Use `rgb(var(--token))` — not `hsl(var(--token))` — or borders/backgrounds disappear.
 */
const selectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    cursor: 'default',
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: state.isFocused ? 'rgb(var(--primary))' : 'rgb(var(--border))',
    backgroundColor: 'rgb(var(--background) / 0.3)',
    boxShadow: state.isFocused
      ? '0 0 0 4px rgb(var(--primary) / 0.25), 0 1px 2px 0 rgb(0 0 0 / 0.05)'
      : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '&:hover': {
      borderColor: state.isFocused ? 'rgb(var(--primary))' : 'rgb(var(--primary) / 0.45)',
    },
  }),
  menu: (base: object) => ({
    ...base,
    zIndex: 50,
    borderRadius: 12,
    border: '1px solid rgb(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
    backgroundColor: 'rgb(var(--popover))',
  }),
  menuList: (base: object) => ({
    ...base,
    padding: 4,
  }),
  option: (base: object, state: { isFocused: boolean; isSelected: boolean }) => ({
    ...base,
    borderRadius: 8,
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? 'rgb(var(--primary) / 0.12)'
      : state.isFocused
        ? 'rgb(var(--muted))'
        : 'transparent',
    color: 'rgb(var(--foreground))',
  }),
  placeholder: (base: object) => ({
    ...base,
    color: 'rgb(var(--muted-foreground))',
  }),
  input: (base: object) => ({
    ...base,
    color: 'rgb(var(--foreground))',
  }),
  singleValue: (base: object) => ({
    ...base,
    color: 'rgb(var(--foreground))',
  }),
  multiValue: (base: object) => ({
    ...base,
    borderRadius: 8,
    backgroundColor: 'rgb(var(--primary) / 0.12)',
  }),
  multiValueLabel: (base: object) => ({
    ...base,
    color: 'rgb(var(--foreground))',
  }),
  multiValueRemove: (base: object) => ({
    ...base,
    color: 'rgb(var(--muted-foreground))',
    ':hover': {
      backgroundColor: 'rgb(220 38 38 / 0.12)',
      color: 'rgb(220 38 38)',
    },
  }),
  dropdownIndicator: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    color: state.isFocused ? 'rgb(var(--primary))' : 'rgb(var(--muted-foreground))',
    padding: '0 10px',
    ':hover': { color: 'rgb(var(--primary))' },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  clearIndicator: (base: object) => ({
    ...base,
    color: 'rgb(var(--muted-foreground))',
    ':hover': { color: 'rgb(var(--foreground))' },
  }),
};

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select...',
  noOptionsMessage = 'No results found.',
  error,
  helperText,
  label,
  fullWidth,
  className,
  isDisabled,
  isSearchable = true,
}: MultiSelectProps) {
  const selectOptions: MultiSelectOption[] = options;

  const selectValue = selectOptions.filter((opt) =>
    value.some((v) => String(v) === String(opt.value))
  );

  const handleChange = (newValue: MultiValue<MultiSelectOption>) => {
    onChange?.(newValue.map((opt) => opt.value));
  };

  return (
    <div className={cn(fullWidth && 'w-full', className)}>
      {label && <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>}
      <ReactSelect<MultiSelectOption, true, GroupBase<MultiSelectOption>>
        isMulti
        options={selectOptions}
        value={selectValue}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={() => noOptionsMessage}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        className={cn(fullWidth && 'w-full')}
        classNamePrefix="react-select"
        styles={{
          ...selectStyles,
          control: (base, state) => ({
            ...selectStyles.control(base, state),
            ...(error
              ? {
                  borderColor: 'rgb(220 38 38)',
                  boxShadow: '0 0 0 4px rgb(220 38 38 / 0.15)',
                }
              : {}),
          }),
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: 'rgb(var(--primary))',
            primary75: 'rgb(var(--primary) / 0.75)',
            primary50: 'rgb(var(--primary) / 0.5)',
            primary25: 'rgb(var(--primary) / 0.25)',
            neutral0: 'rgb(var(--background))',
            neutral5: 'rgb(var(--muted))',
            neutral10: 'rgb(var(--muted))',
            neutral20: 'rgb(var(--border))',
            neutral30: 'rgb(var(--border))',
            neutral40: 'rgb(var(--muted-foreground))',
            neutral50: 'rgb(var(--muted-foreground))',
            neutral60: 'rgb(var(--muted-foreground))',
            neutral70: 'rgb(var(--foreground))',
            neutral80: 'rgb(var(--foreground))',
            neutral90: 'rgb(var(--foreground))',
          },
        })}
      />
      {helperText && (
        <p className={cn('mt-1 text-xs', error ? 'text-red-600' : 'text-muted-foreground')}>
          {helperText}
        </p>
      )}
    </div>
  );
}
