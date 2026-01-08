import { SimpleSelect, type SimpleSelectProps } from '../select';

export interface CustomSelectProps extends Omit<SimpleSelectProps, 'label' | 'helperText' | 'error'> {
  name?: string;
}

export function CustomSelect({ name, ...props }: CustomSelectProps) {
  return <SimpleSelect id={name} {...props} />;
}

