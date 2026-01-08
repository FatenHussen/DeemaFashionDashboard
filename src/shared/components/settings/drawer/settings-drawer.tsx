import type { ThemeColorScheme } from 'src/theme/types';
import type { SettingsState, SettingsDrawerProps } from '../types';

import { useEffect, useCallback } from 'react';
import { hasKeys } from 'minimal-shared/utils';

import { themeConfig } from 'src/theme/theme-config';
import { primaryColorPresets } from 'src/theme/with-settings';
import { Box, Badge, Drawer, Tooltip, IconButton, Typography } from 'src/shared/ui';

import { settingIcons } from './icons';
import { Iconify } from '../../iconify';
import { BaseOption } from './base-option';
import { Scrollbar } from '../../scrollbar';
import { SmallBlock, LargeBlock } from './styles';
import { PresetsOptions } from './presets-options';
import { useColorScheme } from './use-color-scheme';
import { FullScreenButton } from './fullscreen-button';
import { FontSizeOptions, FontFamilyOptions } from './font-options';
import { useSettingsContext } from '../context/use-settings-context';
import { NavColorOptions, NavLayoutOptions } from './nav-layout-option';

// ----------------------------------------------------------------------

export function SettingsDrawer({ defaultSettings }: SettingsDrawerProps) {
  const settings = useSettingsContext();

  const { mode, setMode, colorScheme, systemMode } = useColorScheme();

  useEffect(() => {
    if (mode === 'system' && systemMode) {
      settings.setState({ colorScheme: systemMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, systemMode]);

  // Sync colorScheme from settings to document class on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.state.colorScheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.state.colorScheme]);

  // Helper function to convert hex color to RGB format (space-separated)
  const hexToRgb = (hex: string): string => {
    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `${r} ${g} ${b}`;
  };

  // Apply primary color to CSS variables when it changes
  useEffect(() => {
    const root = document.documentElement;
    const selectedPreset = primaryColorPresets[settings.state.primaryColor];

    if (selectedPreset && selectedPreset.main) {
      // Convert hex to RGB format (space-separated for CSS variables)
      const rgbValue = hexToRgb(selectedPreset.main);

      // Update CSS variable for both light and dark themes
      root.style.setProperty('--primary', rgbValue);

      // Also update primary-foreground if contrastText is available
      if (selectedPreset.contrastText) {
        const contrastRgb = hexToRgb(selectedPreset.contrastText);
        root.style.setProperty('--primary-foreground', contrastRgb);
      }
    }
  }, [settings.state.primaryColor]);

  // Visible options by default settings
  const isFontFamilyVisible = hasKeys(defaultSettings, ['fontFamily']);
  const isCompactLayoutVisible = hasKeys(defaultSettings, ['compactLayout']);
  const isDirectionVisible = hasKeys(defaultSettings, ['direction']);
  const isColorSchemeVisible = hasKeys(defaultSettings, ['colorScheme']);
  const isContrastVisible = hasKeys(defaultSettings, ['contrast']);
  const isNavColorVisible = hasKeys(defaultSettings, ['navColor']);
  const isNavLayoutVisible = hasKeys(defaultSettings, ['navLayout']);
  const isPrimaryColorVisible = hasKeys(defaultSettings, ['primaryColor']);
  const isFontSizeVisible = hasKeys(defaultSettings, ['fontSize']);

  const handleReset = useCallback(() => {
    settings.onReset();
    setMode(defaultSettings.colorScheme as ThemeColorScheme);
  }, [defaultSettings.colorScheme, setMode, settings]);

  const renderHead = () => (
    <Box className="py-2 pr-2 pl-5 flex items-center">
      <Typography variant="h6" className="grow">
        Settings
      </Typography>

      <FullScreenButton />

      <Tooltip title="Reset all">
        <IconButton onClick={handleReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Close">
        <IconButton onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = () => (
    <BaseOption
      label="Dark mode"
      selected={settings.state.colorScheme === 'dark'}
      icon={<span className="w-6 h-6">{settingIcons.moon}</span>}
      onChangeOption={() => {
        const selectedMode = colorScheme === 'light' ? 'dark' : 'light';
        setMode(selectedMode);
        settings.setState({ colorScheme: selectedMode });
        // Toggle dark class on document element
        const root = document.documentElement;
        if (selectedMode === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }}
    />
  );

  const renderContrast = () => (
    <BaseOption
      label="Contrast"
      selected={settings.state.contrast === 'hight'}
      icon={<span className="w-6 h-6">{settingIcons.contrast}</span>}
      onChangeOption={() => {
        settings.setState({
          contrast: settings.state.contrast === 'default' ? 'hight' : 'default',
        });
      }}
    />
  );

  const renderRtl = () => (
    <BaseOption
      label="Right to left"
      selected={settings.state.direction === 'rtl'}
      icon={<span className="w-6 h-6">{settingIcons.alignRight}</span>}
      onChangeOption={() => {
        settings.setState({ direction: settings.state.direction === 'ltr' ? 'rtl' : 'ltr' });
      }}
    />
  );

  const renderCompact = () => (
    <BaseOption
      tooltip="Dashboard only and available at large resolutions > 1600px (xl)"
      label="Compact"
      selected={!!settings.state.compactLayout}
      icon={<span className="w-6 h-6">{settingIcons.autofitWidth}</span>}
      onChangeOption={() => {
        settings.setState({ compactLayout: !settings.state.compactLayout });
      }}
    />
  );

  const renderPresets = () => (
    <LargeBlock
      title="Presets"
      canReset={settings.state.primaryColor !== defaultSettings.primaryColor}
      onReset={() => {
        settings.setState({ primaryColor: defaultSettings.primaryColor });
      }}
    >
      <PresetsOptions
        icon={<span className="w-7 h-7">{settingIcons.siderbarDuotone}</span>}
        options={(Object.keys(primaryColorPresets) as SettingsState['primaryColor'][]).map(
          (key) => ({
            name: key,
            value: primaryColorPresets[key].main,
          })
        )}
        value={settings.state.primaryColor}
        onChangeOption={(newOption) => {
          settings.setState({ primaryColor: newOption });
        }}
      />
    </LargeBlock>
  );

  const renderNav = () => (
    <LargeBlock title="Nav" tooltip="Dashboard only" className="gap-5">
      {isNavLayoutVisible && (
        <SmallBlock
          label="Layout"
          canReset={settings.state.navLayout !== defaultSettings.navLayout}
          onReset={() => {
            settings.setState({ navLayout: defaultSettings.navLayout });
          }}
        >
          <NavLayoutOptions
            value={settings.state.navLayout}
            onChangeOption={(newOption) => {
              settings.setState({ navLayout: newOption });
            }}
            options={[
              {
                value: 'vertical',
                icon: <span className="w-full h-auto">{settingIcons.navVertical}</span>,
              },
              {
                value: 'horizontal',
                icon: <span className="w-full h-auto">{settingIcons.navHorizontal}</span>,
              },
              {
                value: 'mini',
                icon: <span className="w-full h-auto">{settingIcons.navMini}</span>,
              },
            ]}
          />
        </SmallBlock>
      )}
      {isNavColorVisible && (
        <SmallBlock
          label="Color"
          canReset={settings.state.navColor !== defaultSettings.navColor}
          onReset={() => {
            settings.setState({ navColor: defaultSettings.navColor });
          }}
        >
          <NavColorOptions
            value={settings.state.navColor}
            onChangeOption={(newOption) => {
              settings.setState({ navColor: newOption });
            }}
            options={[
              {
                label: 'Integrate',
                value: 'integrate',
                icon: <span className="w-6 h-6">{settingIcons.sidebarOutline}</span>,
              },
              {
                label: 'Apparent',
                value: 'apparent',
                icon: <span className="w-6 h-6">{settingIcons.sidebarFill}</span>,
              },
            ]}
          />
        </SmallBlock>
      )}
    </LargeBlock>
  );

  const renderFont = () => (
    <LargeBlock title="Font" className="gap-5">
      {isFontFamilyVisible && (
        <SmallBlock
          label="Family"
          canReset={settings.state.fontFamily !== defaultSettings.fontFamily}
          onReset={() => {
            settings.setState({ fontFamily: defaultSettings.fontFamily });
          }}
        >
          <FontFamilyOptions
            value={settings.state.fontFamily}
            onChangeOption={(newOption) => {
              settings.setState({ fontFamily: newOption });
            }}
            options={[
              themeConfig.fontFamily.primary,
              'Inter Variable',
              'DM Sans Variable',
              'Nunito Sans Variable',
            ]}
            icon={<span className="w-7 h-7">{settingIcons.font}</span>}
          />
        </SmallBlock>
      )}
      {isFontSizeVisible && (
        <SmallBlock
          label="Size"
          canReset={settings.state.fontSize !== defaultSettings.fontSize}
          onReset={() => {
            settings.setState({ fontSize: defaultSettings.fontSize });
          }}
          className="gap-10"
        >
          <FontSizeOptions
            options={[12, 20]}
            value={settings.state.fontSize}
            onChangeOption={(newOption) => {
              settings.setState({ fontSize: newOption });
            }}
          />
        </SmallBlock>
      )}
    </LargeBlock>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      width="360px"
      slotProps={{
        backdrop: { invisible: true },
      }}
    >
      {renderHead()}

      <Scrollbar>
        <Box className="pb-10 gap-12 px-5 flex flex-col">
          <Box className="gap-2 grid grid-cols-2">
            {isColorSchemeVisible && renderMode()}
            {isContrastVisible && renderContrast()}
            {isDirectionVisible && renderRtl()}
            {isCompactLayoutVisible && renderCompact()}
          </Box>

          {(isNavColorVisible || isNavLayoutVisible) && renderNav()}
          {isPrimaryColorVisible && renderPresets()}
          {(isFontFamilyVisible || isFontSizeVisible) && renderFont()}
        </Box>
      </Scrollbar>
    </Drawer>
  );
}
