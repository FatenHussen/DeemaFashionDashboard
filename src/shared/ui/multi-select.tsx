import type { GroupBase, MultiValue, OptionProps, MultiValueProps } from 'react-select';

import { cn } from '@/utils/utils';
import { Iconify } from '@/shared/components/iconify';
import ReactSelect, { components as selectComponents } from 'react-select';
import { ShopVariantColorSwatch } from '@/shared/components/shop-variant-color-swatch';
import { categoryTreeIndentPx } from '@/pages/dashboard/categories/utils/build-parent-picker-options';

import { isActiveLanguageArabic } from 'src/lib/language-code';

// ----------------------------------------------------------------------

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  /** Category tree depth for menu row indent (optional). */
  depth?: number;
  /** Category has subcategories (folder icon). */
  hasChildren?: boolean;
  /** Resolved absolute URL; used when `showOptionImages` is true */
  imageUrl?: string | null;
  /** e.g. `#F0E68C` from shop variant label; shown as swatch when `showOptionImages` is true */
  colorHex?: string | null;
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
  /** Renders `imageUrl` next to each option and in selected chips (e.g. shop product variants). */
  showOptionImages?: boolean;
}

function MultiSelectOptionWithImage(
  props: OptionProps<MultiSelectOption, true, GroupBase<MultiSelectOption>>
) {
  const img = props.data.imageUrl;
  const ok = img != null && String(img).trim() !== '';
  const hex = props.data.colorHex;
  const hexOk = hex != null && String(hex).trim() !== '';
  const indentPx = categoryTreeIndentPx(props.data.depth ?? 0);
  const showFolder = props.data.hasChildren === true;
  return (
    <selectComponents.Option {...props}>
      <div
        className="flex items-center gap-2 min-w-0 py-0.5"
        style={indentPx != null ? { paddingInlineStart: indentPx } : undefined}
      >
        {showFolder ? (
          <Iconify
            icon="solar:folder-2-bold"
            width={16}
            className="shrink-0 text-amber-600/85 dark:text-amber-400/90"
            aria-hidden
          />
        ) : null}
        {hexOk ? <ShopVariantColorSwatch hex={String(hex).trim()} /> : null}
        {ok ? (
          <img
            src={String(img).trim()}
            alt=""
            className="h-7 w-7 shrink-0 rounded-md border border-border/50 object-cover bg-muted"
          />
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30">
            <Iconify icon="solar:gallery-minimalistic-bold" width={14} className="text-muted-foreground/60" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm">{props.data.label}</span>
      </div>
    </selectComponents.Option>
  );
}

function MultiSelectOptionDefault(
  props: OptionProps<MultiSelectOption, true, GroupBase<MultiSelectOption>>
) {
  const indentPx = categoryTreeIndentPx(props.data.depth ?? 0);
  const showFolder = props.data.hasChildren === true;
  return (
    <selectComponents.Option {...props}>
      <div
        className="flex min-w-0 items-center gap-2 text-sm text-foreground"
        style={indentPx != null ? { paddingInlineStart: indentPx } : undefined}
      >
        <span className="flex w-[18px] shrink-0 justify-center" aria-hidden>
          {showFolder ? (
            <Iconify
              icon="solar:folder-2-bold"
              width={16}
              className="text-amber-600/85 dark:text-amber-400/90"
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{props.data.label}</span>
      </div>
    </selectComponents.Option>
  );
}

function MultiSelectValueWithImage(
  props: MultiValueProps<MultiSelectOption, true, GroupBase<MultiSelectOption>>
) {
  const img = props.data.imageUrl;
  const ok = img != null && String(img).trim() !== '';
  const hex = props.data.colorHex;
  const hexOk = hex != null && String(hex).trim() !== '';
  return (
    <selectComponents.MultiValue {...props}>
      <div className="flex max-w-[min(100%,220px)] items-center gap-1 min-w-0">
        {hexOk ? <ShopVariantColorSwatch hex={String(hex).trim()} size="sm" /> : null}
        {ok ? (
          <img
            src={String(img).trim()}
            alt=""
            className="h-4 w-4 shrink-0 rounded object-cover border border-border/50"
          />
        ) : null}
        <span className="min-w-0 truncate">{props.data.label}</span>
      </div>
    </selectComponents.MultiValue>
  );
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
    zIndex: 130,
    borderRadius: 12,
    border: '1px solid rgb(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
    backgroundColor: 'rgb(var(--popover))',
  }),
  menuList: (base: object) => ({
    ...base,
    padding: 4,
  }),
  menuPortal: (base: object) => ({
    ...base,
    zIndex: 9999,
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
  showOptionImages,
}: MultiSelectProps) {
  const dir = isActiveLanguageArabic() ? 'rtl' : 'ltr';
  const selectOptions: MultiSelectOption[] = options;

  const selectValue = selectOptions.filter((opt) =>
    value.some((v) => String(v) === String(opt.value))
  );

  const handleChange = (newValue: MultiValue<MultiSelectOption>) => {
    onChange?.(newValue.map((opt) => opt.value));
  };

  const imageComponents = showOptionImages
    ? {
        Option: MultiSelectOptionWithImage,
        MultiValue: MultiSelectValueWithImage,
      }
    : { Option: MultiSelectOptionDefault };

  return (
    <div className={cn(fullWidth && 'w-full', className)} dir={dir}>
      {label && <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>}
      <ReactSelect<MultiSelectOption, true, GroupBase<MultiSelectOption>>
        isMulti
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        options={selectOptions}
        value={selectValue}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={() => noOptionsMessage}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        className={cn(fullWidth && 'w-full')}
        classNamePrefix="react-select"
        components={imageComponents}
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
          menu: (base) => ({
            ...(selectStyles.menu(base) as object),
            direction: dir,
          }),
          menuList: (base) => ({
            ...(selectStyles.menuList(base) as object),
            direction: dir,
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
