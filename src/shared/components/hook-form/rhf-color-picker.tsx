import { Box, Typography } from '@/shared/ui';
import { useRef, useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HexColorInput, HexColorPicker } from 'react-colorful';

interface RHFColorPickerProps {
  name: string;
  helperText?: string;
}

export function RHFColorPicker({ name, helperText }: RHFColorPickerProps) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box className="w-full">
          <Box className="relative" ref={popoverRef}>
            <Box className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-10 h-10 rounded-lg border-2 border-border shrink-0 cursor-pointer transition-shadow hover:shadow-md"
                style={{ backgroundColor: field.value || '#000000' }}
              />
              <Box className="flex-1 flex items-center gap-2 rounded-lg border border-input bg-background px-3 h-10">
                <span className="text-muted-foreground text-sm">#</span>
                <HexColorInput
                  color={field.value || '#000000'}
                  onChange={field.onChange}
                  prefixed={false}
                  className="w-full bg-transparent text-sm outline-none uppercase font-mono"
                />
              </Box>
            </Box>

            {open && (
              <Box className="absolute z-50 mt-2 p-3 rounded-xl border border-border bg-card shadow-xl">
                <HexColorPicker
                  color={field.value || '#000000'}
                  onChange={field.onChange}
                />
              </Box>
            )}
          </Box>

          <Typography
            variant="caption"
            className={`mt-1.5 block ${error ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {error?.message ?? helperText}
          </Typography>
        </Box>
      )}
    />
  );
}
