import type { TabsProps } from 'src/shared/ui';

import { useIsClient } from 'minimal-shared/hooks';
import { mergeClasses } from 'minimal-shared/utils';

import { Tabs } from 'src/shared/ui';

// ----------------------------------------------------------------------

export type CustomTabsProps = Omit<TabsProps, 'onChange'> & {
  className?: string;
  onChange?: (event: React.SyntheticEvent, value: string | number) => void;
};

export function CustomTabs({ children, className, onChange, ...other }: CustomTabsProps) {
  const isClient = useIsClient();

  const handleChange = (value: string | number) => {
    if (onChange) {
      // Create a synthetic event for compatibility with MUI-style onChange
      const syntheticEvent = {
        target: { value },
        currentTarget: { value },
      } as unknown as React.SyntheticEvent;
      onChange(syntheticEvent, value);
    }
  };

  return (
    <Tabs
      className={mergeClasses(['flex-shrink-0 bg-muted', className])}
      onChange={handleChange}
      {...other}
    >
      {isClient && children}
    </Tabs>
  );
}
