import { mergeClasses } from 'minimal-shared/utils';
import { useState, useContext, createContext } from 'react';

interface TabsContextValue {
  value: string | number;
  onChange: (value: string | number) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  children,
  className,
  variant = 'standard',
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || 0);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const onChange = (newValue: string | number) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    controlledOnChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div
        className={mergeClasses([
          'flex shrink-0 rounded-lg bg-muted p-1',
          variant === 'scrollable' ? 'overflow-x-auto' : '',
          variant === 'fullWidth' ? 'w-full' : '',
          className,
        ])}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabProps {
  value: string | number;
  label: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  className?: string;
}

export function Tab({ value, label, icon, iconPosition = 'start', disabled, className }: TabProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { value: selectedValue, onChange } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      className={mergeClasses([
        'relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-background text-primary shadow-sm'
          : 'text-foreground hover:bg-background/50',
        className,
      ])}
    >
      {icon && iconPosition === 'start' && <span className="flex-shrink-0">{icon}</span>}
      {label}
      {icon && iconPosition === 'end' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}
